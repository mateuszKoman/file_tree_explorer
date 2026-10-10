import {useEffect, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import styles from './SearchBox.module.css'

const DEBOUNCE_MS = 200

function SearchBox() {
    const [searchParams, setSearchParams] = useSearchParams()
    const urlQuery = searchParams.get('q') ?? ''
    const [draft, setDraft] = useState<string | null>(null)
    const [syncedQuery, setSyncedQuery] = useState(urlQuery)
    const [pendingWrite, setPendingWrite] = useState<string | null>(null)

    if (urlQuery !== syncedQuery) {
        setSyncedQuery(urlQuery)
        if (pendingWrite === urlQuery) {
            setPendingWrite(null)
            if (draft !== null && draft.trim() === urlQuery) setDraft(null)
        } else if (draft !== null) {
            setDraft(null)
        }
    }

    useEffect(() => {
        if (draft === null) return
        const trimmed = draft.trim()
        if (trimmed === urlQuery) return
        const timeout = window.setTimeout(() => {
            setPendingWrite(trimmed)
            setSearchParams((previous) => {
                const next = new URLSearchParams(previous)
                if (trimmed === '') next.delete('q')
                else next.set('q', trimmed)
                return next
            }, {replace: true})
        }, DEBOUNCE_MS)
        return () => window.clearTimeout(timeout)
    }, [draft, urlQuery, setSearchParams])

    return (
        <input
            className={styles.input}
            type="search"
            value={draft ?? urlQuery}
            aria-label="Search by name"
            placeholder="Search by name"
            spellCheck={false}
            onChange={(event) => setDraft(event.target.value)}
        />
    )
}

export default SearchBox
