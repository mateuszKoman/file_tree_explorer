import type {NodeInfo, TreeIndex, TreeNode} from './types.ts'

function compareNodes(a: TreeNode, b: TreeNode): number {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name, undefined, {numeric: true})
}

function createInfo(node: TreeNode, parent: NodeInfo | null): NodeInfo {
    const path = parent === null ? '' : parent.path === '' ? node.name : `${parent.path}/${node.name}`
    return {
        node,
        path,
        displayPath: parent === null ? node.name : `${parent.displayPath}/${node.name}`,
        parentPath: parent === null ? null : parent.path,
        depth: parent === null ? 0 : parent.depth + 1,
        childCount: 0,
        childPaths: [],
    }
}

export function buildIndex(tree: TreeNode): TreeIndex {
    const root = createInfo(tree, null)
    const byPath = new Map<string, NodeInfo>()
    const nodes: NodeInfo[] = []
    const stack: NodeInfo[] = [root]

    while (stack.length > 0) {
        const info = stack.pop()!
        byPath.set(info.path, info)
        nodes.push(info)
        if (info.node.type !== 'folder') continue

        const children = info.node.children
            .toSorted(compareNodes)
            .map((child) => createInfo(child, info))
        info.childCount = children.length
        info.childPaths = children.map((child) => child.path)
        for (let i = children.length - 1; i >= 0; i--) stack.push(children[i])
    }

    return {root, byPath, nodes}
}
