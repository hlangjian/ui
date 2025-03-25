import { Ref, RefCallback } from 'react'
import { mergeRefs, RefType } from './merge-refs'

export type MergeTwoProps<T extends object, P extends object> = {
    [key in keyof P | keyof T]:
    key extends keyof P ? P[key] :
    key extends keyof T ? T[key] :
    never
}

export function mergeTwoProps<T extends object, P extends object>(first: T, second: P): MergeTwoProps<T, P> {
    const ret = { ...first } as MergeTwoProps<T, P>

    Object.entries(second).forEach(([key, value]) => {
        switch (true) {
            case key == 'className' && key in first:
                return Object.defineProperty(ret, key, { enumerable: true, value: [first.className, value].join(' ') })

            case key == 'style' && key in first && typeof first.style == 'object':
                return Object.defineProperty(ret, key, { enumerable: true, value: { ...first.style, ...value } })

            case key == 'ref' && key in first:
                return Object.defineProperty(ret, key, { enumerable: true, value: mergeRefs(first.ref as RefType<unknown>, value) })

            case key.startsWith('on') && key in first && typeof first[key as keyof T] == 'function' && typeof value == 'function': {
                const name = key as keyof T
                const firstHandler = first[name] as (...args: unknown[]) => void
                const secondHandler = value as typeof firstHandler
                const handler = (...args: unknown[]) => { firstHandler(...args); secondHandler(...args) }
                return Object.defineProperty(ret, key, { enumerable: true, value: handler })
            }

            default: Object.defineProperty(ret, key, { enumerable: true, value })
        }
    })

    return ret
}

export type MergeProps<T extends object[]> = T extends [infer R] ? R :
    T extends [infer First extends object, infer Second extends object, []] ? MergeTwoProps<First, Second> :
    T extends [infer First extends object, infer Second extends object, ...infer rest extends object[]] ? MergeProps<[MergeTwoProps<First, Second>, ...rest]> :
    never

export type UseRefCallback<T extends object> = { [key in keyof T]: key extends 'ref' ? T[key] extends Ref<infer R> | undefined ? RefCallback<R> : T[key] : T[key] }

export function mergeProps<T extends object[]>(...args: T): UseRefCallback<MergeProps<T>> {
    if (args.length == 0) return {} as UseRefCallback<MergeProps<T>>
    if (args.length == 1) return args[0] as UseRefCallback<MergeProps<T>>
    const [first, ...rest] = args
    return rest.reduce((p, c) => mergeTwoProps(p, c), first) as UseRefCallback<MergeProps<T>>
}
