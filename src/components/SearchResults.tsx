import {useMemo} from 'react'
import {Link} from 'react-router-dom'
import {matchInName, SEARCH_RESULT_LIMIT, search} from '../domain/search.ts'
import type {NodeInfo} from '../domain/types.ts'
import {useNodeHref} from '../state/useNodeHref.ts'
import styles from './SearchResults.module.css'

type SearchResultsProps = {
    nodes: NodeInfo[]
    query: string
    selectedPath: string | null
}

type HighlightedPathProps = {
    displayPath: string
    name: string
    query: string
}

function HighlightedPath({displayPath, name, query}: HighlightedPathProps) {
    const match = matchInName(name, query)
    const nameStart = displayPath.length - name.length
    if (match === null || nameStart < 0 || !displayPath.endsWith(name)) return displayPath
    const start = nameStart + match.index
    const end = start + match.length
    return (
        <>
            {displayPath.slice(0, start)}
            <mark className={styles.mark}>{displayPath.slice(start, end)}</mark>
            {displayPath.slice(end)}
        </>
    )
}

function SearchResults({nodes, query, selectedPath}: SearchResultsProps) {
    const href = useNodeHref()
    const found = useMemo(() => search(nodes, query), [nodes, query])

    if (found.total === 0) {
        return <p className={styles.empty} role="status">No matching nodes.</p>
    }

    return (
        <div>
            {found.total > SEARCH_RESULT_LIMIT && (
                <p className={styles.cap} role="status">
                    showing first {SEARCH_RESULT_LIMIT} of {found.total}
                </p>
            )}
            <ul className={styles.list}>
                {found.results.map((info) => (
                    <li key={info.displayPath} className={styles.item}>
                        <Link
                            className={info.path === selectedPath ? `${styles.link} ${styles.selected}` : styles.link}
                            to={href(info.path)}
                            aria-current={info.path === selectedPath ? 'page' : undefined}
                        >
                            <HighlightedPath displayPath={info.displayPath} name={info.node.name} query={query}/>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default SearchResults
