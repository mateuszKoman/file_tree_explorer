import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

function HomePage() {
  return (
    <main className={styles.page}>
      <h1>File Tree Explorer</h1>
      <p>Paste or upload a JSON tree to explore it.</p>
      <Link to="/tree">Open tree</Link>
    </main>
  )
}

export default HomePage
