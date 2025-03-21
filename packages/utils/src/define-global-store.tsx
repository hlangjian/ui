import { PropsWithChildren, useEffect, useMemo, useState } from "react"
import { proxy, useSnapshot } from "valtio"

export function defineGlobalStore<Options extends {}, State extends {}>(useHook: (options: Options) => State) {

    const useStore = (key: string, options: Options) => {

        const state = useHook(options)

        const store = useMemo(() => {
            if (map.has(key)) throw Error()
            return proxy({ state })
        }, [])

        useEffect(() => { store.state = state }, [state])

        return state
    }

    const useListener = (key: string) => {
        return useSnapshot(map.get(key)!.state)
    }

    const map = new Map<string, { state: State }>()

    return { useStore, useSnapshot: useListener, map }
}

const { useStore, useSnapshot: useSnapshotLocal } = defineGlobalStore((options: { count: number }) => {
    const { count } = options
    const [page, setPage] = useState(0)
    return { page, setPage, count }
})

function State(props: PropsWithChildren) {
    const { page, setPage, count } = useStore('key', { count: 10 })
    return props.children
}

function Button(props: { name: string }) {
    const { name } = props

    const { page, setPage, count } = useSnapshotLocal(name)
    return <button onClick={() => setPage(page)}>{page}</button>
}

/**
 * 1. run hooks...
 * 2. compose state and store in GloablStore by keys
 */
