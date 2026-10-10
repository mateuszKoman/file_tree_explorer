import {describe, expect, it} from 'vitest'
import {search} from './search.ts'
import type {NodeInfo, TreeNode} from './types.ts'

function node(name: string, path: string, type: TreeNode['type'] = 'file'): NodeInfo {
    const treeNode: TreeNode = type === 'folder'
        ? {name, type: 'folder', children: []}
        : {name, type: 'file', size: 1}
    return {
        node: treeNode,
        path,
        displayPath: path === '' ? name : `root/${path}`,
        parentPath: path === '' ? null : '',
        depth: path === '' ? 0 : path.split('/').length,
        childCount: 0,
        childPaths: [],
        subtreeSize: type === 'file' ? 1 : 0,
    }
}

describe('search', () => {
    it('matches a name regardless of case', () => {
        const nodes = [
            node('App.tsx', 'src/App.tsx'),
            node('readme.md', 'readme.md'),
        ]

        const found = search(nodes, 'APP')

        expect(found.results.map((info) => info.node.name)).toEqual(['App.tsx'])
        expect(found.total).toBe(1)
    })

    it('matches a substring of the name and ignores the path', () => {
        const nodes = [
            node('Button.tsx', 'src/components/Button.tsx'),
            node('notes.txt', 'button/notes.txt'),
        ]

        const found = search(nodes, 'ton')

        expect(found.results.map((info) => info.path)).toEqual(['src/components/Button.tsx'])
        expect(found.total).toBe(1)
    })

    it('trims the query before matching', () => {
        const nodes = [
            node('App.tsx', 'src/App.tsx'),
            node('readme.md', 'readme.md'),
        ]

        const found = search(nodes, '  app  ')

        expect(found.results.map((info) => info.node.name)).toEqual(['App.tsx'])
        expect(found.total).toBe(1)
        expect(search(nodes, '   ')).toEqual({results: [], total: 0})
    })

    it('matches folders and the root', () => {
        const root = node('project', '', 'folder')
        const folder = node('ProjectNotes', 'docs', 'folder')
        const file = node('readme.md', 'readme.md')

        const found = search([root, folder, file], 'project')

        expect(found.results.map((info) => info.path)).toEqual(['', 'docs'])
        expect(found.total).toBe(2)
    })

    it('returns at most 500 matches and the total count', () => {
        const nodes = [
            node('skip.txt', 'skip.txt'),
            ...Array.from({length: 501}, (_, index) => node(`hit${index}`, `dir/hit${index}`)),
        ]

        const found = search(nodes, 'hit')

        expect(found.results).toHaveLength(500)
        expect(found.total).toBe(501)
        expect(found.results[0]?.path).toBe('dir/hit0')
        expect(found.results[499]?.path).toBe('dir/hit499')
    })
})
