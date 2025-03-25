export function range(length: number): number[] {
    return Array.from({ length }).map((_, i) => i)
}