
interface HasInstance {
    [Symbol.hasInstance](instance: unknown): boolean
    prototype: unknown
}

export function instanceOf<Types extends HasInstance[]>(value: unknown, ...types: Types): value is Types[number]['prototype'] {
    return types.some(type => value instanceof type)
}