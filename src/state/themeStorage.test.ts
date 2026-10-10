import {describe, expect, it} from 'vitest'
import type {KeyValueStorage} from './treeStorage.ts'
import {readStoredTheme, saveTheme, THEME_STORAGE_KEY, themeFromPreference, type Theme} from './themeStorage.ts'

function memoryStorage(): KeyValueStorage & {raw(): string | null} {
    const data = new Map<string, string>()
    return {
        getItem(key) {
            return data.get(key) ?? null
        },
        setItem(key, value) {
            data.set(key, value)
        },
        removeItem(key) {
            data.delete(key)
        },
        raw() {
            return data.get(THEME_STORAGE_KEY) ?? null
        },
    }
}

function blocked(method: 'getItem' | 'setItem'): KeyValueStorage {
    const fail = () => {
        throw new Error('storage blocked')
    }
    return {
        getItem: method === 'getItem' ? fail : () => 'dark',
        setItem: method === 'setItem' ? fail : () => {},
        removeItem: () => {},
    }
}

describe('themeStorage', () => {
    it('saves and reads a theme', () => {
        const storage = memoryStorage()

        saveTheme(storage, 'dark')

        expect(storage.raw()).toBe('dark')
        expect(readStoredTheme(storage)).toBe('dark')
    })

    it('ignores values that are not a theme', () => {
        const storage = memoryStorage()
        storage.setItem(THEME_STORAGE_KEY, 'blue')

        expect(readStoredTheme(storage)).toBeNull()
    })

    it('treats a throwing read as no stored theme', () => {
        expect(readStoredTheme(blocked('getItem'))).toBeNull()
    })

    it('swallows a throwing write', () => {
        expect(() => saveTheme(blocked('setItem'), 'light')).not.toThrow()
    })

    it('treats missing storage as unavailable', () => {
        expect(readStoredTheme(null)).toBeNull()
        expect(() => saveTheme(null, 'light')).not.toThrow()
    })

    it('uses the stored theme ahead of the system preference', () => {
        expect(themeFromPreference('light', true)).toBe('light')
        expect(themeFromPreference('dark', false)).toBe('dark')
    })

    it('follows the system preference when nothing is stored', () => {
        const cases: [Theme | null, boolean, Theme][] = [
            [null, true, 'dark'],
            [null, false, 'light'],
        ]
        for (const [stored, prefersDark, expected] of cases) {
            expect(themeFromPreference(stored, prefersDark)).toBe(expected)
        }
    })
})
