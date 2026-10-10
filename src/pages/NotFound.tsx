import {Link} from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle.tsx'
import styles from './NotFound.module.css'

function NotFound() {
    return (
        <main className={styles.page}>
            <div className={styles.toolbar}>
                <ThemeToggle/>
            </div>
            <h1 className={styles.title}>Page not found</h1>
            <p className={styles.text}>That address does not match a page in this app.</p>
            <Link className={styles.link} to="/">Go to home page</Link>
        </main>
    )
}

export default NotFound
