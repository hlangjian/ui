import { useMemo } from 'react'
import { create, StoreApi, UseBoundStore, useStore } from 'zustand'

export interface PromiseController<T> {
    status: 'complete' | 'failed' | 'pending'
    value?: T
    getPromise: () => Promise<T | void | null> | null
    start: (force?: boolean) => void
    cancel: () => void
}

export type PromiseControllerStore<T> = UseBoundStore<StoreApi<PromiseController<T>>>

const getEmptyPromise = () => null

export function createPromiseController<T>(factory: () => Promise<T>): PromiseControllerStore<T> {
    return create<PromiseController<T>>((set, get) => {

        function start(force: boolean = false) {

            const state = get()

            if (state.getPromise() && !force) return

            const promise = new Promise<T>((resolve, reject) => {
                set({ getPromise: () => promise, status: 'pending' })
                factory().then(resolve, reject).catch(reject)
            })

            const maybeSuccess = promise.then(value => {
                const state = get()
                if (state.getPromise() !== promise) return
                set({ status: 'complete', value })
                return value
            })

            const maybeFailed = maybeSuccess.catch(reason => {
                const state = get()
                if (state.getPromise() !== promise) return
                set({ status: 'failed' })
                console.error(reason)
            })

            maybeFailed.finally(() => {
                const state = get()

                if (state.getPromise() !== promise) return
                set({ getPromise: getEmptyPromise })
            })
        }

        const cancel = () => set({ getPromise: getEmptyPromise })

        return { start, cancel, status: 'pending', getPromise: getEmptyPromise }
    })
}

export function usePromiseController<T>(factory: () => Promise<T>, autoStart: boolean = true): PromiseController<T> {
    return useStore(useMemo(() => {
        const store = createPromiseController(factory)
        if (autoStart) store.getState().start()
        return store
    }, [factory, autoStart]))
}