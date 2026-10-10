import {useLocation} from 'react-router-dom'
import {nodeUrl} from '../domain/paths.ts'

export function useNodeHref(): (path: string) => string {
    const {search, hash} = useLocation()
    return (path: string) => `${nodeUrl(path)}${search}${hash}`
}
