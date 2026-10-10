import { Link, Outlet } from 'react-router-dom'
import styles from './TreeLayout.module.css'

function TreeLayout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/">Load another</Link>
      </header>
      <nav className={styles.tree} aria-label="File tree">
        <p>Tree goes here.</p>
      </nav>
      <section className={styles.details}>
        <Outlet />
      </section>
    </div>
  )
}

export default TreeLayout
