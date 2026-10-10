import type {KeyValueStorage} from './treeStorage.ts'

/** Also read in index.html before paint. Keep the two in sync. */
export const THEME_STORAGE_KEY = 'file-tree-explorer_theme'

export type Theme = 'light' | 'dark'

export function isTheme(value: string | null): value is Theme {
    return value === 'light' || value === 'dark'
}

export function readStoredTheme(storage: KeyValueStorage | null): Theme | null {
    if (storage === null) return null
    try {
        const value = storage.getItem(THEME_STORAGE_KEY)
        return isTheme(value) ? value : null
    } catch {
        return null
    }
}

export function saveTheme(storage: KeyValueStorage | null, theme: Theme): void {
    if (storage === null) return
    try {
        storage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
        // The choice still applies for this visit when storage is blocked.
    }
}

export function themeFromPreference(stored: Theme | null, prefersDark: boolean): Theme {
    if (stored !== null) return stored
    return prefersDark ? 'dark' : 'light'
}
