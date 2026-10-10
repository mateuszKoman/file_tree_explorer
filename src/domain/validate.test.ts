import {describe, expect, it} from 'vitest'
import {parseTree, validateTree} from './validate.ts'

describe('validateTree', () => {
    it('accepts a valid tree and returns it', () => {
        const data = {
            name: 'root',
            type: 'folder',
            children: [
                {
                    name: 'src',
                    type: 'folder',
                    children: [
                        {name: 'index.ts', type: 'file', size: 1024},
                        {name: 'empty', type: 'folder', children: []},
                    ],
                },
                {name: 'package.json', type: 'file', size: 0},
            ],
        }

        expect(validateTree(data)).toEqual({ok: true, tree: data})
    })

    it.each([[null], [42], ['root'], [[]], [true]])('rejects a non-object root: %j', (data) => {
        expect(validateTree(data)).toEqual({ok: false, error: 'root must be an object'})
    })

    it('rejects a file root', () => {
        expect(validateTree({name: 'a.txt', type: 'file', size: 1})).toEqual({
            ok: false,
            error: 'root.type must be "folder"',
        })
    })

    it('points at the offending field of a nested child', () => {
        const data = {
            name: 'root',
            type: 'folder',
            children: [
                {name: 'a.ts', type: 'file', size: 1},
                {name: 'b.ts', type: 'file', size: 2},
                {name: 'c.ts', type: 'file', size: -1},
            ],
        }

        expect(validateTree(data)).toEqual({
            ok: false,
            error: 'root.children[2].size must be a non-negative number',
        })
    })

    it.each([[undefined], ['1024'], [NaN], [Infinity], [-0.5]])('rejects file size %j', (size) => {
        const data = {name: 'root', type: 'folder', children: [{name: 'a.ts', type: 'file', size}]}

        expect(validateTree(data)).toEqual({
            ok: false,
            error: 'root.children[0].size must be a non-negative number',
        })
    })

    it.each([['dir'], [undefined], [42]])('rejects node type %j', (type) => {
        const data = {name: 'root', type: 'folder', children: [{name: 'x', type, children: []}]}

        expect(validateTree(data)).toEqual({
            ok: false,
            error: 'root.children[0].type must be "folder" or "file"',
        })
    })

    it.each([[undefined], [''], [7]])('rejects node name %j', (name) => {
        const data = {name: 'root', type: 'folder', children: [{name, type: 'file', size: 1}]}

        expect(validateTree(data)).toEqual({
            ok: false,
            error: 'root.children[0].name must be a non-empty string',
        })
    })

    it('rejects a root without a name', () => {
        expect(validateTree({type: 'folder', children: []})).toEqual({
            ok: false,
            error: 'root.name must be a non-empty string',
        })
    })

    it('rejects a name containing a slash', () => {
        const data = {name: 'root', type: 'folder', children: [{name: 'a/b.ts', type: 'file', size: 1}]}

        expect(validateTree(data)).toEqual({
            ok: false,
            error: 'root.children[0].name must not contain "/"',
        })
    })

    it.each([[undefined], [{}], ['a.ts']])('rejects folder children %j', (children) => {
        const data = {name: 'root', type: 'folder', children: [{name: 'src', type: 'folder', children}]}

        expect(validateTree(data)).toEqual({
            ok: false,
            error: 'root.children[0].children must be an array',
        })
    })

    it('rejects a root folder without children', () => {
        expect(validateTree({name: 'root', type: 'folder'})).toEqual({
            ok: false,
            error: 'root.children must be an array',
        })
    })

    it('rejects a child that is not an object', () => {
        const data = {name: 'root', type: 'folder', children: [{name: 'a.ts', type: 'file', size: 1}, 'b.ts']}

        expect(validateTree(data)).toEqual({ok: false, error: 'root.children[1] must be an object'})
    })

    it('rejects siblings with the same name, even of different types', () => {
        const data = {
            name: 'root',
            type: 'folder',
            children: [
                {name: 'src', type: 'folder', children: []},
                {name: 'a.ts', type: 'file', size: 1},
                {name: 'src', type: 'file', size: 2},
            ],
        }

        expect(validateTree(data)).toEqual({
            ok: false,
            error: 'root.children[2].name "src" duplicates root.children[0].name',
        })
    })

    it('allows the same name in different folders', () => {
        const data = {
            name: 'root',
            type: 'folder',
            children: [
                {name: 'a', type: 'folder', children: [{name: 'index.ts', type: 'file', size: 1}]},
                {name: 'b', type: 'folder', children: [{name: 'index.ts', type: 'file', size: 1}]},
            ],
        }

        expect(validateTree(data).ok).toBe(true)
    })

    it('validates a 50k-level deep tree without overflowing the stack', () => {
        const tree = buildDeepTree(DEEP, {name: 'leaf.txt', type: 'file', size: 1})

        expect(validateTree(tree).ok).toBe(true)
    })

    it('locates an error at the bottom of a 50k-level deep tree', () => {
        const tree = buildDeepTree(DEEP, {name: 'leaf.txt', type: 'file', size: -1})

        const result = validateTree(tree)

        expect(result.ok).toBe(false)
        if (result.ok) return
        expect(result.error).toBe(`root${'.children[0]'.repeat(DEEP)}.size must be a non-negative number`)
    })
})

describe('parseTree', () => {
    it('parses and validates a JSON string', () => {
        const raw = '{"name":"root","type":"folder","children":[{"name":"a.ts","type":"file","size":3}]}'

        expect(parseTree(raw)).toEqual({
            ok: true,
            tree: {name: 'root', type: 'folder', children: [{name: 'a.ts', type: 'file', size: 3}]},
        })
    })

    it.each([[''], ['   \n']])('rejects empty input %j', (raw) => {
        expect(parseTree(raw)).toEqual({ok: false, error: 'Paste or upload some JSON first.'})
    })

    it('rejects invalid JSON with a readable message', () => {
        const result = parseTree('{"name": "root",')

        expect(result.ok).toBe(false)
        if (result.ok) return
        expect(result.error).toMatch(/^Invalid JSON: .+/)
    })

    it('reports schema errors with their location', () => {
        const raw = '{"name":"root","type":"folder","children":[{"name":"a.ts","type":"file","size":"big"}]}'

        expect(parseTree(raw)).toEqual({
            ok: false,
            error: 'root.children[0].size must be a non-negative number',
        })
    })

    it('parses and validates a 50k-level deep JSON string', () => {
        const raw = '{"name":"d","type":"folder","children":['.repeat(DEEP)
            + '{"name":"leaf.txt","type":"file","size":1}'
            + ']}'.repeat(DEEP)

        expect(parseTree(raw).ok).toBe(true)
    })
})

const DEEP = 50_000

function buildDeepTree(depth: number, leaf: object): object {
    let node: object = leaf
    for (let i = 0; i < depth; i++) node = {name: `d${i}`, type: 'folder', children: [node]}
    return node
}
