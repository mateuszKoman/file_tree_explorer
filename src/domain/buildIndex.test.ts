import {describe, expect, it} from 'vitest'
import {buildIndex} from './buildIndex.ts'
import type {FolderNode, TreeNode} from './types.ts'

describe('buildIndex', () => {
    it('indexes a root-only tree under the empty path', () => {
        const tree: FolderNode = {name: 'root', type: 'folder', children: []}

        const index = buildIndex(tree)

        expect(index.root).toMatchObject({
            node: tree,
            path: '',
            displayPath: 'root',
            parentPath: null,
            depth: 0,
            childCount: 0,
            childPaths: [],
        })
        expect(index.byPath.get('')).toBe(index.root)
        expect(index.nodes).toEqual([index.root])
    })

    it('builds slash-joined paths without the root name and display paths with it', () => {
        const tree: FolderNode = {
            name: 'root',
            type: 'folder',
            children: [
                {
                    name: 'src',
                    type: 'folder',
                    children: [
                        {
                            name: 'components',
                            type: 'folder',
                            children: [{name: 'Button.tsx', type: 'file', size: 512}],
                        },
                    ],
                },
            ],
        }

        const index = buildIndex(tree)

        expect(index.byPath.get('src')).toMatchObject({
            displayPath: 'root/src',
            parentPath: '',
            depth: 1,
        })
        expect(index.byPath.get('src/components')).toMatchObject({
            displayPath: 'root/src/components',
            parentPath: 'src',
            depth: 2,
        })
        expect(index.byPath.get('src/components/Button.tsx')).toMatchObject({
            node: {name: 'Button.tsx', type: 'file', size: 512},
            path: 'src/components/Button.tsx',
            displayPath: 'root/src/components/Button.tsx',
            parentPath: 'src/components',
            depth: 3,
        })
        expect(index.nodes.map((info) => info.path)).toEqual([
            '',
            'src',
            'src/components',
            'src/components/Button.tsx',
        ])
    })

    it('counts only direct children, with zero for files and empty folders', () => {
        const tree: FolderNode = {
            name: 'root',
            type: 'folder',
            children: [
                {
                    name: 'src',
                    type: 'folder',
                    children: [
                        {name: 'a.ts', type: 'file', size: 1},
                        {name: 'b.ts', type: 'file', size: 2},
                        {name: 'lib', type: 'folder', children: [{name: 'c.ts', type: 'file', size: 3}]},
                    ],
                },
                {name: 'empty', type: 'folder', children: []},
                {name: 'package.json', type: 'file', size: 300},
            ],
        }

        const index = buildIndex(tree)

        expect(index.root.childCount).toBe(3)
        expect(index.byPath.get('src')?.childCount).toBe(3)
        expect(index.byPath.get('src/lib')?.childCount).toBe(1)
        expect(index.byPath.get('empty')?.childCount).toBe(0)
        expect(index.byPath.get('package.json')?.childCount).toBe(0)
        expect(index.nodes).toHaveLength(8)
    })

    it('orders children folders first, then files, each alphabetically and numeric-aware', () => {
        const tree: FolderNode = {
            name: 'root',
            type: 'folder',
            children: [
                {name: 'file10.txt', type: 'file', size: 1},
                {name: 'zeta', type: 'folder', children: []},
                {name: 'file2.txt', type: 'file', size: 1},
                {
                    name: 'alpha',
                    type: 'folder',
                    children: [
                        {name: 'b.ts', type: 'file', size: 1},
                        {name: 'a.ts', type: 'file', size: 1},
                    ],
                },
                {name: 'README.md', type: 'file', size: 1},
            ],
        }

        const index = buildIndex(tree)

        expect(index.root.childPaths).toEqual([
            'alpha',
            'zeta',
            'file2.txt',
            'file10.txt',
            'README.md',
        ])
        expect(index.byPath.get('alpha')?.childPaths).toEqual(['alpha/a.ts', 'alpha/b.ts'])
        expect(index.nodes.map((info) => info.path)).toEqual([
            '',
            'alpha',
            'alpha/a.ts',
            'alpha/b.ts',
            'zeta',
            'file2.txt',
            'file10.txt',
            'README.md',
        ])
    })

    it('sums the sizes of all files in each folder subtree, with zero for empty folders', () => {
        const tree: FolderNode = {
            name: 'root',
            type: 'folder',
            children: [
                {
                    name: 'src',
                    type: 'folder',
                    children: [
                        {name: 'index.ts', type: 'file', size: 1024},
                        {
                            name: 'components',
                            type: 'folder',
                            children: [
                                {name: 'Button.tsx', type: 'file', size: 512},
                                {name: 'empty', type: 'folder', children: []},
                            ],
                        },
                    ],
                },
                {name: 'empty', type: 'folder', children: []},
                {name: 'package.json', type: 'file', size: 300},
            ],
        }

        const index = buildIndex(tree)

        expect(index.root.subtreeSize).toBe(1836)
        expect(index.byPath.get('src')?.subtreeSize).toBe(1536)
        expect(index.byPath.get('src/components')?.subtreeSize).toBe(512)
        expect(index.byPath.get('src/components/empty')?.subtreeSize).toBe(0)
        expect(index.byPath.get('empty')?.subtreeSize).toBe(0)
    })

    it('gives a file its own size as the subtree size', () => {
        const tree: FolderNode = {
            name: 'root',
            type: 'folder',
            children: [{name: 'package.json', type: 'file', size: 300}],
        }

        expect(buildIndex(tree).byPath.get('package.json')?.subtreeSize).toBe(300)
    })

    it('indexes a 50k-level deep tree without overflowing the stack', () => {
        let tree: TreeNode = {name: 'leaf.txt', type: 'file', size: 1}
        for (let i = 0; i < 50_000; i++) tree = {name: 'd', type: 'folder', children: [tree]}

        const index = buildIndex(tree)

        const leaf = index.nodes[index.nodes.length - 1]
        expect(index.nodes).toHaveLength(50_001)
        expect(leaf.depth).toBe(50_000)
        expect(leaf.path).toBe(`${'d/'.repeat(49_999)}leaf.txt`)
        expect(index.root.subtreeSize).toBe(1)
    })
})
