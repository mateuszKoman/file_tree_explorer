import styles from './NodeIcon.module.css'

type NodeIconProps = {
    type: 'folder' | 'file'
}

function NodeIcon({type}: NodeIconProps) {
    const className = type === 'folder' ? styles.folder : styles.file

    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            {type === 'folder' ? (
                <path fill="currentColor" d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            ) : (
                <path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2.5L17.5 9H13V4.5zM6 20V4h5v7h7v9H6z"/>
            )}
        </svg>
    )
}

export default NodeIcon
