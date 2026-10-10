import {type ReactNode, useCallback, useMemo, useState} from 'react'
import {buildIndex} from '../domain/buildIndex.ts'
import type {TreeIndex, TreeNode} from '../domain/types.ts'
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
        if (raw.trim() === '') return {ok: false, error: 'Paste or upload some JSON first.'}

        let data: unknown
        try {
            data = JSON.parse(raw)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            return {ok: false, error: `Invalid JSON: ${message}`}
        }

        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            return {ok: false, error: 'The root of the JSON must be an object.'}
        }

        try {
            setIndex(buildIndex(data as TreeNode))
        } catch {
            return {ok: false, error: 'The JSON does not describe a valid tree.'}
        }
        return {ok: true}
    }, [])

    const clearTree = useCallback(() => setIndex(null), [])

    const value = useMemo(() => ({index, loadTree, clearTree}), [index, loadTree, clearTree])

    return <TreeContext value={value}>{children}</TreeContext>
}

export default TreeProvider
