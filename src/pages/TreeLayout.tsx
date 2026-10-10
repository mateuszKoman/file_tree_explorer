import {useCallback, useState} from 'react'
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

    if (index === null) return <Navigate to="/" replace/>

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <Link to="/">Load another</Link>
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
            <section className={styles.details}>
                <Outlet/>
            </section>
        </div>
    )
}

export default TreeLayout
