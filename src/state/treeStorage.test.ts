import {describe, expect, it} from 'vitest'
import {readTreeRaw, removeTreeRaw, saveTreeRaw, TREE_STORAGE_KEY, type KeyValueStorage} from './treeStorage.ts'

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
            return data.get(TREE_STORAGE_KEY) ?? null
        },
    }
}

function blocked(method: 'getItem' | 'setItem' | 'removeItem'): KeyValueStorage {
    const fail = () => {
        const error = new Error('storage blocked')
        error.name = method === 'setItem' ? 'QuotaExceededError' : 'SecurityError'
        throw error
    }
    return {
        getItem: method === 'getItem' ? fail : () => 'stored',
        setItem: method === 'setItem' ? fail : () => {},
        removeItem: method === 'removeItem' ? fail : () => {},
    }
}

describe('treeStorage', () => {
    it('saves and reads the raw string under the tree key', () => {
        const storage = memoryStorage()
        const raw = '{"name":"root","type":"folder","children":[]}'

        expect(saveTreeRaw(storage, raw)).toBe(true)
        expect(storage.raw()).toBe(raw)
        expect(readTreeRaw(storage)).toBe(raw)
    })

    it('reports a failed write when setItem throws', () => {
        expect(saveTreeRaw(blocked('setItem'), '{}')).toBe(false)
    })

    it('treats a throwing getItem as no stored tree', () => {
        expect(readTreeRaw(blocked('getItem'))).toBeNull()
    })

    it('swallows a throwing removeItem', () => {
        expect(() => removeTreeRaw(blocked('removeItem'))).not.toThrow()
    })

    it('treats missing storage as unavailable', () => {
        expect(readTreeRaw(null)).toBeNull()
        expect(saveTreeRaw(null, '{}')).toBe(false)
        expect(() => removeTreeRaw(null)).not.toThrow()
    })
})
