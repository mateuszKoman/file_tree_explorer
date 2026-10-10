import {type ReactNode, useCallback, useMemo, useState} from 'react'
import {buildIndex} from '../domain/buildIndex.ts'
import type {TreeIndex} from '../domain/types.ts'
import {parseTree} from '../domain/validate.ts'
import {activeStorage, readTreeRaw, removeTreeRaw, saveTreeRaw} from './treeStorage.ts'
import {TreeContext} from "./useTreeContext.ts";

export type LoadResult = { ok: true } | { ok: false; error: string }

export type TreeContextValue = {
    index: TreeIndex | null
    storageWarning: boolean
    loadTree: (raw: string) => LoadResult
    clearTree: () => void
}

function indexFromStorage(): TreeIndex | null {
    const storage = activeStorage()
    const raw = readTreeRaw(storage)
    if (raw === null) return null

    const result = parseTree(raw)
    if (!result.ok) {
        removeTreeRaw(storage)
        return null
    }
    return buildIndex(result.tree)
}

function TreeProvider({children}: { children: ReactNode }) {
    const [index, setIndex] = useState<TreeIndex | null>(indexFromStorage)
    const [storageWarning, setStorageWarning] = useState(false)

    const loadTree = useCallback((raw: string): LoadResult => {
        const result = parseTree(raw)
        if (!result.ok) return result

        setIndex(buildIndex(result.tree))
        setStorageWarning(!saveTreeRaw(activeStorage(), raw))
        return {ok: true}
    }, [])

    const clearTree = useCallback(() => {
        setIndex(null)
        setStorageWarning(false)
        removeTreeRaw(activeStorage())
    }, [])

    const value = useMemo(
        () => ({index, storageWarning, loadTree, clearTree}),
        [index, storageWarning, loadTree, clearTree],
    )

    return <TreeContext value={value}>{children}</TreeContext>
}

export default TreeProvider
