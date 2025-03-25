import { useEffect, useMemo } from "react"
import { proxy, useSnapshot as useValtioSnapshot } from "valtio"

type Keys = string | number | (string | number)[]

export function createGlobalStore<Store extends object>() {
    const map = new Map<string, { value: Store }>()

    function usePersist(keys: Keys, value: Store) {

        const key = serializeKey(keys)

        const store = useMemo(() => {
            if (map.has(key)) throw Error()

            const store = proxy({ value })
            map.set(key, store)
            return store
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [key])

        Object.assign(store.value, value)

        useEffect(() => () => { map.delete(key) }, [key])

        return value
    }

    function getStore(keys: Keys) {

        const key = serializeKey(keys)

        const store = map.get(key)
        if (store == null) throw Error()
        return store.value
    }

    function useSnapshot(keys: Keys) {

        const key = serializeKey(keys)

        const store = map.get(key)
        if (store == null) throw Error()
        return useValtioSnapshot(store).value
    }

    return { map, usePersist, getStore, useSnapshot }
}

function serializeKey(key: Keys): string {
    if (typeof key === "string" || typeof key === "number") {
        return String(key)
    }
    if (Array.isArray(key)) {
        return `[${key.map(serializeKey).join(",")}]`
    }
    if (key === null) {
        return "null"
    }
    return String(key)
}