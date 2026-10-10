import {Link} from 'react-router-dom'
import {formatSize} from '../domain/formatSize.ts'
import {useSelectedPath} from '../state/useSelectedPath.ts'
import {useTreeContext} from '../state/useTreeContext.ts'
import styles from './NodeDetails.module.css'

function NodeDetails() {
    const {index} = useTreeContext()
    const path = useSelectedPath()
    const info = path === null ? undefined : index?.byPath.get(path)

    if (info === undefined) {
        return (
            <div className={styles.notFound}>
                <h2>Node not found</h2>
                <p>No node in the loaded tree matches this address.</p>
                <Link to="/tree">Go to the root folder</Link>
            </div>
        )
    }

    const {node} = info

    return (
        <article>
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
        </article>
    )
}

export default NodeDetails
