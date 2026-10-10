import {type ReactNode, useCallback, useMemo, useState} from 'react'
import {buildIndex} from '../domain/buildIndex.ts'
import type {TreeIndex} from '../domain/types.ts'
import {parseTree} from '../domain/validate.ts'
import {TreeContext} from "./useTreeContext.ts";

export type LoadResult = { ok: true } | { ok: false; error: string }

export type TreeContextValue = {
    index: TreeIndex | null
    loadTree: (raw: string) => LoadResult
    clearTree: () => void
}

function TreeProvider({children}: { children: ReactNode }) {
    const [index, setIndex] = useState<TreeIndex | null>(null)

    const loadTree = useCallback((raw: string): LoadResult => {
        const result = parseTree(raw)
        if (!result.ok) return result

        setIndex(buildIndex(result.tree))
        return {ok: true}
    }, [])

    const clearTree = useCallback(() => setIndex(null), [])

    const value = useMemo(() => ({index, loadTree, clearTree}), [index, loadTree, clearTree])

    return <TreeContext value={value}>{children}</TreeContext>
}

export default TreeProvider
