export const TREE_STORAGE_KEY = 'file-tree-explorer_tree'

export type KeyValueStorage = {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
    removeItem(key: string): void
}

export function activeStorage(): KeyValueStorage | null {
    try {
        return localStorage
    } catch {
        return null
    }
}

export function readTreeRaw(storage: KeyValueStorage | null): string | null {
    if (storage === null) return null
    try {
        return storage.getItem(TREE_STORAGE_KEY)
    } catch {
        return null
    }
}

export function saveTreeRaw(storage: KeyValueStorage | null, raw: string): boolean {
    if (storage === null) return false
    try {
        storage.setItem(TREE_STORAGE_KEY, raw)
        return true
    } catch {
        return false
    }
}

export function removeTreeRaw(storage: KeyValueStorage | null): void {
    if (storage === null) return
    try {
        storage.removeItem(TREE_STORAGE_KEY)
    } catch {
        // Storage can throw SecurityError when it is blocked.
    }
}
