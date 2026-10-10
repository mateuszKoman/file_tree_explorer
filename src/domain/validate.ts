import type {TreeNode} from './types.ts'

export type ValidationResult = { ok: true; tree: TreeNode } | { ok: false; error: string }

type Frame = {
    value: unknown
    parent: Frame | null
    index: number
    siblings: Map<string, Frame> | null
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function locate(frame: Frame): string {
    const parts: string[] = []
    for (let current: Frame | null = frame; current !== null; current = current.parent) {
        parts.push(current.parent === null ? 'root' : `children[${current.index}]`)
    }
    return parts.reverse().join('.')
}

function checkNode(frame: Frame): string | null {
    const node = frame.value
    if (!isObject(node)) return ' must be an object'
    if (frame.parent === null && node.type !== 'folder') return '.type must be "folder"'
    if (node.type !== 'folder' && node.type !== 'file') return '.type must be "folder" or "file"'
    if (typeof node.name !== 'string' || node.name === '') return '.name must be a non-empty string'
    if (node.name.includes('/')) return '.name must not contain "/"'

    const twin = frame.siblings?.get(node.name)
    if (twin !== undefined) return `.name "${node.name}" duplicates ${locate(twin)}.name`
    frame.siblings?.set(node.name, frame)

    if (node.type === 'file') {
        if (typeof node.size !== 'number' || !Number.isFinite(node.size) || node.size < 0) {
            return '.size must be a non-negative number'
        }
    } else if (!Array.isArray(node.children)) {
        return '.children must be an array'
    }
    return null
}

export function validateTree(data: unknown): ValidationResult {
    const stack: Frame[] = [{value: data, parent: null, index: 0, siblings: null}]

    while (stack.length > 0) {
        const frame = stack.pop()!
        const problem = checkNode(frame)
        if (problem !== null) return {ok: false, error: locate(frame) + problem}

        const node = frame.value as Record<string, unknown>
        if (node.type !== 'folder') continue
        const children = node.children as unknown[]
        const siblings = new Map<string, Frame>()
        for (let i = children.length - 1; i >= 0; i--) {
            stack.push({value: children[i], parent: frame, index: i, siblings})
        }
    }

    return {ok: true, tree: data as TreeNode}
}

export function parseTree(raw: string): ValidationResult {
    if (raw.trim() === '') return {ok: false, error: 'Paste or upload some JSON first.'}

    let data: unknown
    try {
        data = JSON.parse(raw)
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return {ok: false, error: `Invalid JSON: ${message}`}
    }
    return validateTree(data)
}
