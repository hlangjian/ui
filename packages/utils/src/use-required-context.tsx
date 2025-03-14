import { use } from "react";

export function useRequiredContext<T>(context: React.Context<T>) {
    const data = use(context)
    if (!data) throw Error(`must be wrapped in ${context.displayName ?? context.name}`)
    return data
}