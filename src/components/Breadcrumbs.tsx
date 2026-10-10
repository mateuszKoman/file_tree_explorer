import {Link} from 'react-router-dom'
import {ancestorPaths} from '../domain/paths.ts'
import type {NodeInfo} from '../domain/types.ts'
import {useNodeHref} from '../state/useNodeHref.ts'
import styles from './Breadcrumbs.module.css'

type BreadcrumbsProps = {
    info: NodeInfo
    byPath: Map<string, NodeInfo>
}

function Breadcrumbs({info, byPath}: BreadcrumbsProps) {
    const href = useNodeHref()
    const paths = [...ancestorPaths(info.path), info.path]

    return (
        <nav className={styles.nav} aria-label="Breadcrumb">
            <ol className={styles.list}>
                {paths.map((path, index) => {
                    const crumb = byPath.get(path)
                    if (crumb === undefined) return null
                    const current = path === info.path
                    return (
                        <li key={path} className={styles.item}>
                            {index > 0 && <span className={styles.separator} aria-hidden="true">/</span>}
                            {current ? (
                                <span className={styles.current} aria-current="page">{crumb.node.name}</span>
                            ) : (
                                <Link className={styles.link} to={href(path)}>{crumb.node.name}</Link>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

export default Breadcrumbs
