import {useMemo} from 'react'
import type {NodeInfo, TreeIndex} from '../domain/types.ts'
import TreeNodeRow from './TreeNodeRow.tsx'
import styles from './TreeView.module.css'

type TreeViewProps = {
    index: TreeIndex
    expanded: Set<string>
    onToggle: (path: string) => void
}

function collectVisibleRows(index: TreeIndex, expanded: Set<string>): NodeInfo[] {
    const rows: NodeInfo[] = []
    const stack: NodeInfo[] = [index.root]
    while (stack.length > 0) {
        const info = stack.pop()!
        rows.push(info)
        if (!expanded.has(info.path)) continue
        for (let i = info.childPaths.length - 1; i >= 0; i--) {
            stack.push(index.byPath.get(info.childPaths[i])!)
        }
    }
    return rows
}

function TreeView({index, expanded, onToggle}: TreeViewProps) {
    const rows = useMemo(() => collectVisibleRows(index, expanded), [index, expanded])

    return (
        <ul className={styles.tree} role="tree" aria-label="File tree">
            {rows.map((info) => (
                <TreeNodeRow
                    key={info.path}
                    info={info}
                    expanded={expanded.has(info.path)}
                    onToggle={onToggle}
                />
            ))}
        </ul>
    )
}

export default TreeView
