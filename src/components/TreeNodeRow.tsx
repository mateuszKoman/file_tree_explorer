import {memo} from 'react'
import {Link} from 'react-router-dom'
import {nodeUrl} from '../domain/paths.ts'
import type {NodeInfo} from '../domain/types.ts'
import styles from './TreeNodeRow.module.css'

type TreeNodeRowProps = {
    info: NodeInfo
    expanded: boolean
    selected: boolean
    onToggle: (path: string) => void
}

const INDENT_PX = 16

function TreeNodeRow({info, expanded, selected, onToggle}: TreeNodeRowProps) {
    const isFolder = info.node.type === 'folder'
    const canExpand = isFolder && info.childCount > 0

    return (
        <li
            className={selected ? `${styles.row} ${styles.selected}` : styles.row}
            role="treeitem"
            aria-label={info.node.name}
            aria-level={info.depth + 1}
            aria-expanded={canExpand ? expanded : undefined}
            aria-selected={selected}
            style={{paddingLeft: info.depth * INDENT_PX}}
        >
            {canExpand ? (
                <button
                    type="button"
                    className={styles.toggle}
                    aria-expanded={expanded}
                    aria-label={info.node.name}
                    onClick={() => onToggle(info.path)}
                >
                    <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
                </button>
            ) : (
                <span className={styles.spacer}/>
            )}
            <span className={styles.icon} aria-hidden="true">
        {isFolder ? '📁' : '📄'}
      </span>
            <Link
                to={nodeUrl(info.path)}
                className={styles.name}
                aria-current={selected ? 'page' : undefined}
            >
                {info.node.name}
            </Link>
        </li>
    )
}

export default memo(TreeNodeRow)
