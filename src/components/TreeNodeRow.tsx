import {memo} from 'react'
import {Link} from 'react-router-dom'
import type {NodeInfo} from '../domain/types.ts'
import {useNodeHref} from '../state/useNodeHref.ts'
import NodeIcon from './NodeIcon.tsx'
import styles from './TreeNodeRow.module.css'

type TreeNodeRowProps = {
    info: NodeInfo
    expanded: boolean
    selected: boolean
    onToggle: (path: string) => void
}

const INDENT_PX = 16

function TreeNodeRow({info, expanded, selected, onToggle}: TreeNodeRowProps) {
    const href = useNodeHref()
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
                    <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true">
                        <path
                            fill="currentColor"
                            d={expanded
                                ? 'M3.2 5.4 8 10.2l4.8-4.8 1 1L8 12.2 2.2 6.4z'
                                : 'M6 3.2 11 8 6 12.8 5 11.8 9 8 5 4.2z'}
                        />
                    </svg>
                </button>
            ) : (
                <span className={styles.spacer}/>
            )}
            <NodeIcon type={isFolder ? 'folder' : 'file'}/>
            <Link
                to={href(info.path)}
                className={styles.name}
                aria-current={selected ? 'page' : undefined}
            >
                {info.node.name}
            </Link>
        </li>
    )
}

export default memo(TreeNodeRow)
