import {type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'
import {activeStorage} from './treeStorage.ts'
import {readStoredTheme, saveTheme, themeFromPreference, type Theme} from './themeStorage.ts'
import {ThemeContext} from './useTheme.ts'

function prefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function ThemeProvider({children}: {children: ReactNode}) {
    const [theme, setThemeState] = useState<Theme>(() => themeFromPreference(readStoredTheme(activeStorage()), prefersDark()))
    const [followsSystem, setFollowsSystem] = useState(() => readStoredTheme(activeStorage()) === null)

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme
    }, [theme])

    useEffect(() => {
        if (!followsSystem) return
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const onChange = () => setThemeState(themeFromPreference(null, media.matches))
        media.addEventListener('change', onChange)
        return () => media.removeEventListener('change', onChange)
    }, [followsSystem])

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next)
        setFollowsSystem(false)
        saveTheme(activeStorage(), next)
    }, [])

    const value = useMemo(() => ({theme, setTheme}), [theme, setTheme])

    return <ThemeContext value={value}>{children}</ThemeContext>
}

export default ThemeProvider
