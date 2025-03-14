import { RefObject } from 'react'

export type RefType<T> = RefObject<T | null> | ((e: T | null) => (void | (() => void)))

type MergedRef<T> = (e: T | null) => void

export function mergeRefs<T>(...refs: Array<RefObject<T | null> | ((e: T | null) => void) | null | undefined>): MergedRef<T> {
    const cleanups: Array<() => void> = []

    return (element: T | null) => {
        for (const ref of refs) {
            if (typeof ref === 'function') {
                const cleanup = ref(element)
                if (typeof cleanup === 'function') cleanups.push(cleanup)
            }
            else if (ref) ref.current = element
        }

        return () => {
            cleanups.forEach(cleanup => cleanup())
        }
    }
}
