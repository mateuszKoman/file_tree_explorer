import type {NodeInfo} from './types.ts'

export const SEARCH_RESULT_LIMIT = 500

export type SearchHits = {
    results: NodeInfo[]
    total: number
}

export type NameMatch = {
    index: number
    length: number
}

export function matchInName(name: string, query: string): NameMatch | null {
    const trimmed = query.trim()
    if (trimmed === '') return null
    const needle = trimmed.toLowerCase()
    const index = name.toLowerCase().indexOf(needle)
    if (index === -1) return null
    return {index, length: needle.length}
}

export function search(nodes: NodeInfo[], query: string): SearchHits {
    const results: NodeInfo[] = []
    let total = 0
    for (const info of nodes) {
        if (matchInName(info.node.name, query) === null) continue
        total += 1
        if (results.length < SEARCH_RESULT_LIMIT) results.push(info)
    }
    return {results, total}
}
