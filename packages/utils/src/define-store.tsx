import { createContext, PropsWithChildren, ReactNode, useDebugValue } from "react"
import { useRequiredContext } from "./use-required-context"
import { proxy, useSnapshot } from "valtio"

export interface StoreContext<T extends {}> {
    useInit: (state: T) => void
    useSnapshot: () => T
    useStore: () => T
}

export type DefineStoreReturn<
    THook extends (...args: any) => any,
    TState extends ReturnType<THook> = ReturnType<THook>,
    TOptions extends Parameters<THook>[0] = Parameters<THook>[0]
> = {
    Provider: (props: { [key in keyof PropsWithChildren<TOptions>]: PropsWithChildren<TOptions>[key] }) => ReactNode
    Context: React.Context<StoreContext<TState> | null>;
    useStore: () => TState;
    useSnapshot: () => TState;
}

export function defineStore<
    THook extends (...args: any) => any,
    TState extends ReturnType<THook> = ReturnType<THook>,
    TOptions extends Parameters<THook>[0] = Parameters<THook>[0]
>(factory: THook): DefineStoreReturn<THook> {

    const Context = createContext<null | StoreContext<TState>>(null)

    const Provider = ({ children, ...rest }: PropsWithChildren<TOptions>) => (
        <Context value={createStoreContext()}>
            <StateProvider {...rest as TOptions} />
            {children}
        </Context>
    )

    const StateProvider = (options: TOptions) => {
        const context = useRequiredContext(Context)
        const state = factory(options)
        context.useInit(state)
        return null
    }

    const useStore = () => {
        useDebugValue(factory.name)
        return useRequiredContext(Context).useStore()
    }

    const useSnapshot = () => {
        useDebugValue(factory.name)
        return useRequiredContext(Context).useSnapshot()
    }

    if (factory.name.length > 1) {
        const name = factory.name.charAt(0).toUpperCase() + factory.name.slice(1)
        Context.displayName = `${name}StoreContext`
        Provider.displayName = `${name}Provider`
        StateProvider.displayName = `${name}StateProvider`
    }

    return { Provider, Context, useStore, useSnapshot } as const
}

function createStoreContext<T extends {}>(): StoreContext<T> {

    const store = proxy<{ state: null | T }>({ state: null })

    const state = new Proxy({} as T, {
        get(_, p, receiver) {
            const currentState = store.state
            if (currentState == null) throw Error()
            return Reflect.get(currentState, p, receiver)
        }
    })

    return {
        useInit: state => store.state = state,
        useSnapshot: () => useSnapshot(store).state as T,
        useStore: () => state
    }
}