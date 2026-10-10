import {Link} from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs.tsx'
import {formatSize} from '../domain/formatSize.ts'
import {useNodeHref} from '../state/useNodeHref.ts'
import {useSelectedPath} from '../state/useSelectedPath.ts'
import {useTreeContext} from '../state/useTreeContext.ts'
import styles from './NodeDetails.module.css'

function NodeDetails() {
    const {index} = useTreeContext()
    const path = useSelectedPath()
    const href = useNodeHref()
    const info = path === null ? undefined : index?.byPath.get(path)

    if (index === null || info === undefined) {
        return (
            <div className={styles.notFound}>
                <h2>Node not found</h2>
                <p>No node in the loaded tree matches this address.</p>
                <Link className={styles.rootLink} to={href('')}>Go to the root folder</Link>
            </div>
        )
    }

    const {node} = info

    return (
        <article>
            <Breadcrumbs info={info} byPath={index.byPath}/>
            <h2 className={styles.name}>
                <span aria-hidden="true">{node.type === 'folder' ? '📁' : '📄'}</span> {node.name}
            </h2>
            <dl className={styles.facts}>
                <dt>Type</dt>
                <dd>{node.type === 'folder' ? 'Folder' : 'File'}</dd>
                {node.type === 'folder' ? (
                    <>
                        <dt>Children</dt>
                        <dd>{info.childCount}</dd>
                        <dt>Total size</dt>
                        <dd title={`${info.subtreeSize} bytes`}>{formatSize(info.subtreeSize)}</dd>
                    </>
                ) : (
                    <>
                        <dt>Size</dt>
                        <dd title={`${node.size} bytes`}>{formatSize(node.size)}</dd>
                    </>
                )}
                <dt>Path</dt>
                <dd className={styles.path}>{info.displayPath}</dd>
            </dl>
            {node.type === 'folder' && (
                <section className={styles.contents}>
                    <h3 className={styles.contentsHeading}>Contents</h3>
                    {info.childPaths.length === 0 ? (
                        <p className={styles.empty}>This folder is empty.</p>
                    ) : (
                        <ul className={styles.children}>
                            {info.childPaths.map((childPath) => {
                                const child = index.byPath.get(childPath)
                                if (child === undefined) return null
                                const isFolder = child.node.type === 'folder'
                                return (
                                    <li key={childPath} className={styles.child}>
                                        <Link className={styles.childLink} to={href(childPath)}>
                                            <span aria-hidden="true">{isFolder ? '📁' : '📄'}</span>
                                            {' '}
                                            {child.node.name}
                                        </Link>
                                        {child.node.type === 'file' && (
                                            <span className={styles.childSize} title={`${child.node.size} bytes`}>
                                                {formatSize(child.node.size)}
                                            </span>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </section>
            )}
        </article>
    )
}

export default NodeDetails
