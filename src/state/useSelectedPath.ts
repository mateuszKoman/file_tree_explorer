import {useLocation} from 'react-router-dom'
import {decodeNodePath} from '../domain/paths.ts'

const TREE_PREFIX = '/tree'

export const useSelectedPath = (): string | null => {
    const {pathname} = useLocation()
    const segment = pathname.slice(TREE_PREFIX.length).replace(/^\/|\/$/g, '')
    return decodeNodePath(segment)
}
