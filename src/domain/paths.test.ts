import {describe, expect, it} from 'vitest'
import {ancestorPaths, decodeNodePath, encodeNodePath, joinPath, nodeUrl} from './paths.ts'

describe('joinPath', () => {
    it('uses the bare name for a direct child of the root', () => {
        expect(joinPath('', 'src')).toBe('src')
    })

    it('joins nested names with a slash', () => {
        expect(joinPath('src/components', 'Button.tsx')).toBe('src/components/Button.tsx')
    })
})

describe('encodeNodePath / decodeNodePath', () => {
    it('encodes a nested path as a single URL segment', () => {
        expect(encodeNodePath('src/components/Button.tsx')).toBe('src%2Fcomponents%2FButton.tsx')
    })

    it.each([
        ['src/components/Button.tsx'],
        ['my docs/annual report.pdf'],
        ['zdjęcia/żółw 🐢.png'],
        ['100%/50% off.txt'],
        ['issues/#42'],
        ['what?/why?.md'],
        ['a&b=c/+plus'],
    ])('round-trips %j', (path) => {
        const encoded = encodeNodePath(path)

        expect(encoded).not.toMatch(/[/ #?]/)
        expect(decodeNodePath(encoded)).toBe(path)
    })

    it.each([['%E0%A4%A'], ['%'], ['100%'], ['%zz']])('returns null for the malformed encoding %j', (segment) => {
        expect(decodeNodePath(segment)).toBeNull()
    })

    it('returns null for a segment with an unencoded slash', () => {
        expect(decodeNodePath('src/index.ts')).toBeNull()
    })
})

describe('nodeUrl', () => {
    it('links the root to /tree', () => {
        expect(nodeUrl('')).toBe('/tree')
    })

    it('links a node to /tree with its encoded path', () => {
        expect(nodeUrl('my docs/#1?.md')).toBe('/tree/my%20docs%2F%231%3F.md')
    })
})

describe('ancestorPaths', () => {
    it('lists every ancestor from the root down, excluding the node itself', () => {
        expect(ancestorPaths('src/components/Button.tsx')).toEqual(['', 'src', 'src/components'])
    })

    it('has only the root as the ancestor of a top-level node', () => {
        expect(ancestorPaths('package.json')).toEqual([''])
    })

    it('has no ancestors for the root', () => {
        expect(ancestorPaths('')).toEqual([])
    })
})
