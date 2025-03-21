import { useEffect, useId, useMemo } from "react"
import { create, StateCreator, StoreApi, UseBoundStore, useStore } from "zustand"

export type KeysLike<T> = T | T[] | (() => T)

export type Keys = KeysLike<string | number>

export function createGlobalStore<Options extends unknown[], Store>(factory: (...options: Options) => StateCreator<Store>) {

    const useStoreProvider = (keys: Keys, ...options: Options) => {

        const key = useKey(keys)

        if (GlobalStores.has(key)) throw Error()

        const store = useMemo(() => create(factory(...options)), [key])

        useEffect(() => {
            GlobalStores.set(key, store)
            return () => { GlobalStores.delete(key) }
        }, [key])

        useEffect(() => { store.setState(create(factory(...options)).getState()) }, [...options])

        return store
    }

    const useSubscribe = (keys: string | (() => string)) => {

        const key = useKey(keys)

        if (GlobalStores.has(key) == false) throw Error()
        const store = GlobalStores.get(key) as UseBoundStore<StoreApi<Store>>
        return useStore(store)
    }

    return { useStoreProvider, useSubscribe }
}

const useKey = (keys: Keys) => typeof keys == 'function' ? keys().toString() : Array.isArray(keys) ? keys.join('#') : keys.toString()

const GlobalStores = new Map<string, UseBoundStore<StoreApi<unknown>>>()

const { useStoreProvider, useSubscribe } = createGlobalStore((options: { value: string }) => (set, get) => ({

}))