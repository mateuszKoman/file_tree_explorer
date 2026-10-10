import {createContext, useContext} from 'react'
import type {Theme} from './themeStorage.ts'

export type {Theme}

export type ThemeContextValue = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
    const value = useContext(ThemeContext)
    if (value === null) throw new Error('useTheme must be used inside ThemeProvider')
    return value
}
