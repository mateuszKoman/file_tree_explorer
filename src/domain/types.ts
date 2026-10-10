export type FileNode = {
    name: string
    type: 'file'
    size: number
}

export type FolderNode = {
    name: string
    type: 'folder'
    children: TreeNode[]
}

export type TreeNode = FileNode | FolderNode

export type NodeInfo = {
    node: TreeNode
    path: string
    displayPath: string
    parentPath: string | null
    depth: number
    childCount: number
    childPaths: string[]
    subtreeSize: number
}

export type TreeIndex = {
    root: NodeInfo
    byPath: Map<string, NodeInfo>
    nodes: NodeInfo[]
}
