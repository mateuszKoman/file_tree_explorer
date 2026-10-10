export function joinPath(parentPath: string, name: string): string {
    return parentPath === '' ? name : `${parentPath}/${name}`
}

export function ancestorPaths(path: string): string[] {
    if (path === '') return []
    const names = path.split('/')
    const ancestors = ['']
    for (let i = 0; i < names.length - 1; i++) {
        ancestors.push(joinPath(ancestors[i], names[i]))
    }
    return ancestors
}

export function encodeNodePath(path: string): string {
    return encodeURIComponent(path)
}

export function decodeNodePath(segment: string): string | null {
    if (segment.includes('/')) return null
    try {
        return decodeURIComponent(segment)
    } catch {
        return null
    }
}

export function nodeUrl(path: string): string {
    return path === '' ? '/tree' : `/tree/${encodeNodePath(path)}`
}
