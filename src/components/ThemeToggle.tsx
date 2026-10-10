import {useTheme, type Theme} from '../state/useTheme.ts'
import styles from './ThemeToggle.module.css'

const options: {theme: Theme; label: string}[] = [
    {theme: 'light', label: 'Light'},
    {theme: 'dark', label: 'Dark'},
]

function SunIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="2.3" fill="currentColor"/>
            <path
                fill="currentColor"
                d="M7.25.75h1.5v2.1h-1.5zm0 12.4h1.5v2.1h-1.5zM.75 7.25h2.1v1.5H.75zm12.4 0h2.1v1.5h-2.1zM2.7 3.76 3.76 2.7l1.48 1.48-1.06 1.06zm8.06 8.06 1.06-1.06 1.48 1.48-1.06 1.06zM2.7 12.24l1.48-1.48 1.06 1.06-1.48 1.48zm8.06-8.06 1.48-1.48 1.06 1.06-1.48 1.48z"
            />
        </svg>
    )
}

function MoonIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path fill="currentColor" d="M8.6 1.15a6.15 6.15 0 1 0 6.25 7.7A5.05 5.05 0 0 1 8.6 1.15z"/>
        </svg>
    )
}

function ThemeToggle() {
    const {theme, setTheme} = useTheme()

    return (
        <div className={styles.switcher} role="group" aria-label="Color theme">
            {options.map((option) => (
                <button
                    key={option.theme}
                    type="button"
                    className={styles.option}
                    aria-pressed={theme === option.theme}
                    onClick={() => setTheme(option.theme)}
                >
                    {option.theme === 'light' ? <SunIcon/> : <MoonIcon/>}
                    {option.label}
                </button>
            ))}
        </div>
    )
}

export default ThemeToggle
