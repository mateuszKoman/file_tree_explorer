import {joinPath} from './paths.ts'
import type {NodeInfo, TreeIndex, TreeNode} from './types.ts'

type StackEntry = {
    info: NodeInfo
    parent: NodeInfo | null
    exit: boolean
}

function compareNodes(a: TreeNode, b: TreeNode): number {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name, undefined, {numeric: true})
}

function createInfo(node: TreeNode, parent: NodeInfo | null): NodeInfo {
    return {
        node,
        path: parent === null ? '' : joinPath(parent.path, node.name),
        displayPath: parent === null ? node.name : `${parent.displayPath}/${node.name}`,
        parentPath: parent === null ? null : parent.path,
        depth: parent === null ? 0 : parent.depth + 1,
        childCount: 0,
        childPaths: [],
        subtreeSize: node.type === 'file' ? node.size : 0,
    }
}

export function buildIndex(tree: TreeNode): TreeIndex {
    const root = createInfo(tree, null)
    const byPath = new Map<string, NodeInfo>()
    const nodes: NodeInfo[] = []
    const stack: StackEntry[] = [{info: root, parent: null, exit: false}]

    while (stack.length > 0) {
        const {info, parent, exit} = stack.pop()!
        if (!exit) {
            byPath.set(info.path, info)
            nodes.push(info)
        }
        if (exit || info.node.type !== 'folder') {
            if (parent !== null) parent.subtreeSize += info.subtreeSize
            continue
        }

        const children = info.node.children
            .toSorted(compareNodes)
            .map((child) => createInfo(child, info))
        info.childCount = children.length
        info.childPaths = children.map((child) => child.path)
        stack.push({info, parent, exit: true})
        for (let i = children.length - 1; i >= 0; i--) stack.push({info: children[i], parent: info, exit: false})
    }

    return {root, byPath, nodes}
}
