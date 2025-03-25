import { createGlobalStore } from "@/utils/create-global-store"
import { useState } from "react"

export interface RadioStore {
    value?: string
    setValue: (value: string) => void
}

export const { usePersist: useRadioPersist, useSnapshot: useRadioSnapshot, getStore: getRadioStore } = createGlobalStore<RadioStore>()

export interface RadioOptions {
    defaultValue?: string
    key: string
}

export function useRadio({ defaultValue, key }: RadioOptions) {
    const [value, setValue] = useState(defaultValue)
    return useRadioPersist(key, { value, setValue })
}
