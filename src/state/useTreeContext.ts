import {createContext, useContext} from 'react'
import type {TreeContextValue} from "./TreeProvider.tsx";

export const TreeContext = createContext<TreeContextValue | null>(null)

export const useTreeContext = (): TreeContextValue => {
    const value = useContext(TreeContext)
    if (value === null) throw new Error('useTree must be used inside TreeProvider')
    return value
}