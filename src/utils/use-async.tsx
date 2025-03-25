import { composePromise } from "./compose-promise"
import { usePromiseController } from "./promise-controller"

export interface UseAsyncOptions<T> {
    autoStart?: boolean
    pipeline?: Array<(getPromise: () => Promise<T>) => () => Promise<T>>
}

export function useAsync<T>(getPromise: () => Promise<T>, options: UseAsyncOptions<T> = {}) {
    const { pipeline = [], autoStart = true } = options
    const { start, cancel, value, status } = usePromiseController(composePromise(getPromise, pipeline), autoStart)
    return { value, status, start, cancel, isAvaliable: isAvaliable<T> }
}

function isAvaliable<T>(value: T | undefined, status: 'complete' | 'failed' | 'pending'): value is T {
    return status === 'complete'
}