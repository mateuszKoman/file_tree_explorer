import {useCallback, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent} from 'react'
import {Link, Navigate, Outlet, useSearchParams} from 'react-router-dom'
import SearchBox from '../components/SearchBox.tsx'
import SearchResults from '../components/SearchResults.tsx'
import TreeView from '../components/TreeView.tsx'
import {ancestorPaths} from '../domain/paths.ts'
import type {NodeInfo} from '../domain/types.ts'
import {useSelectedPath} from '../state/useSelectedPath.ts'
import styles from './TreeLayout.module.css'
import {useTreeContext} from "../state/useTreeContext.ts";

function withAncestors(expanded: Set<string>, path: string): Set<string> {
    const missing = ancestorPaths(path).filter((ancestor) => !expanded.has(ancestor))
    if (missing.length === 0) return expanded
    return new Set([...expanded, ...missing])
}

const DEFAULT_TREE_WIDTH = 300
const MIN_TREE_WIDTH = 160
const RESIZER_WIDTH = 6
const DETAILS_MIN_WIDTH = 240

function clampTreeWidth(width: number): number {
    const max = Math.max(MIN_TREE_WIDTH, window.innerWidth - RESIZER_WIDTH - DETAILS_MIN_WIDTH)
    return Math.min(Math.max(width, MIN_TREE_WIDTH), max)
}

function folderPaths(nodes: NodeInfo[]): Set<string> {
    const paths = new Set<string>()
    for (const info of nodes) {
        if (info.node.type === 'folder') paths.add(info.path)
    }
    return paths
}

function TreeLayout() {
    const {index, storageWarning} = useTreeContext()
    const selectedPath = useSelectedPath()
    const [searchParams] = useSearchParams()
    const query = (searchParams.get('q') ?? '').trim()
    const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['']))
    const [revealedPath, setRevealedPath] = useState<string | null>(null)
    const [treeWidth, setTreeWidth] = useState(DEFAULT_TREE_WIDTH)

    if (index !== null && selectedPath !== revealedPath) {
        setRevealedPath(selectedPath)
        if (selectedPath !== null && index.byPath.has(selectedPath)) {
            setExpanded((previous) => withAncestors(previous, selectedPath))
        }
    }

    const toggle = useCallback((path: string) => {
        setExpanded((previous) => {
            const next = new Set(previous)
            if (next.has(path)) next.delete(path)
            else next.add(path)
            return next
        })
    }, [])

    const expandAll = useCallback(() => {
        if (index === null) return
        setExpanded(folderPaths(index.nodes))
    }, [index])

    const collapseAll = useCallback(() => {
        setExpanded(new Set(['']))
    }, [])

    const startResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault()
        const handle = event.currentTarget
        const startX = event.clientX
        const startWidth = treeWidth
        const previousCursor = document.body.style.cursor
        document.body.style.cursor = 'col-resize'
        try {
            handle.setPointerCapture(event.pointerId)
        } catch {
            // Pointer capture needs a real press.
        }

        function onMove(moveEvent: PointerEvent) {
            setTreeWidth(clampTreeWidth(startWidth + moveEvent.clientX - startX))
        }

        function onUp(upEvent: PointerEvent) {
            handle.removeEventListener('pointermove', onMove)
            handle.removeEventListener('pointerup', onUp)
            document.body.style.cursor = previousCursor
            if (handle.hasPointerCapture(upEvent.pointerId)) handle.releasePointerCapture(upEvent.pointerId)
        }

        handle.addEventListener('pointermove', onMove)
        handle.addEventListener('pointerup', onUp)
    }, [treeWidth])

    const resizeFromKeyboard = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
        const step = event.shiftKey ? 48 : 16
        if (event.key === 'ArrowLeft') {
            event.preventDefault()
            setTreeWidth((width) => clampTreeWidth(width - step))
        } else if (event.key === 'ArrowRight') {
            event.preventDefault()
            setTreeWidth((width) => clampTreeWidth(width + step))
        }
    }, [])

    if (index === null) return <Navigate to="/" replace/>

    return (
        <div className={styles.layout} style={{gridTemplateColumns: `${treeWidth}px ${RESIZER_WIDTH}px 1fr`}}>
            <header className={styles.header}>
                <Link className={styles.link} to="/">Load another</Link>
                <SearchBox/>
                <button type="button" className={styles.button} onClick={expandAll}>Expand all</button>
                <button type="button" className={styles.button} onClick={collapseAll}>Collapse all</button>
                {storageWarning && (
                    <p className={styles.warning} role="status">This tree will not survive a refresh.</p>
                )}
            </header>
            <nav className={styles.tree} aria-label={query === '' ? 'Tree panel' : 'Search results'}>
                {query === '' ? (
                    <TreeView index={index} expanded={expanded} selectedPath={selectedPath} onToggle={toggle}/>
                ) : (
                    <SearchResults nodes={index.nodes} query={query} selectedPath={selectedPath}/>
                )}
            </nav>
            <button
                type="button"
                className={styles.resizer}
                aria-orientation="vertical"
                aria-label="Resize tree panel"
                aria-valuemin={MIN_TREE_WIDTH}
                aria-valuenow={treeWidth}
                onPointerDown={startResize}
                onKeyDown={resizeFromKeyboard}
            />
            <section className={styles.details}>
                <Outlet/>
            </section>
        </div>
    )
}

export default TreeLayout
