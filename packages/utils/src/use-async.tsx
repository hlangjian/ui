import { composePromise } from "compose-promise"
import { usePromiseController } from "./promise-controller"

export function useAsync<T>(getPromise: () => Promise<T>, ...pipeline: Array<(getPromise: () => Promise<T>) => () => Promise<T>>) {
    const { start, cancel, value, status } = usePromiseController(composePromise(getPromise, ...pipeline), true)
    return { value, status, start, cancel, isAvaliable: isAvaliable<T> }
}

function isAvaliable<T>(value: T | undefined, status: 'complete' | 'failed' | 'pending'): value is T {
    return status === 'complete'
}