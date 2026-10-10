import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

function NotFound() {
  return (
    <main className={styles.page}>
      <h1>404: Page not found</h1>
      <Link to="/">Go to home page</Link>
    </main>
  )
}

export default NotFound
