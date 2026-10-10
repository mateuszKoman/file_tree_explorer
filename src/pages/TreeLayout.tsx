import {useCallback, useState} from 'react'
import {Link, Navigate, Outlet} from 'react-router-dom'
import TreeView from '../components/TreeView.tsx'
import styles from './TreeLayout.module.css'
import {useTreeContext} from "../state/useTreeContext.ts";

function TreeLayout() {
    const {index} = useTreeContext()
    const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['']))

    const toggle = useCallback((path: string) => {
        setExpanded((previous) => {
            const next = new Set(previous)
            if (next.has(path)) next.delete(path)
            else next.add(path)
            return next
        })
    }, [])

    if (index === null) return <Navigate to="/" replace/>

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <Link to="/">Load another</Link>
            </header>
            <nav className={styles.tree} aria-label="Tree panel">
                <TreeView index={index} expanded={expanded} onToggle={toggle}/>
            </nav>
            <section className={styles.details}>
                <Outlet/>
            </section>
        </div>
    )
}

export default TreeLayout
