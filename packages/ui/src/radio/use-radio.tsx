import { createGlobalStore, mergeProps } from "@joyfourl/utils"
import { Slot } from "radix-ui"
import { ButtonHTMLAttributes, DetailedHTMLProps, HTMLAttributes, useState } from "react"

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

export interface RadioButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    value?: string
    "store-key": string
    asChild?: boolean
}

export function RadioButton({ value, "store-key": key, asChild = false, ...rest }: RadioButtonProps) {
    const { value: currentValue, setValue } = useRadioSnapshot(key)
    const props = mergeProps({
        onPointerDown: () => value && setValue(value),
        className: 'radio',
        "aria-checked": value === currentValue,
        role: 'radio',
        type: 'button',
        value
    } satisfies Partial<RadioButtonProps>, rest)

    return asChild ? <Slot.Root {...props} /> : <button {...props} />
}

export interface RadioGroupProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
    asChild?: boolean
}

export function RadioGroup({ asChild = false, ...rest }: RadioGroupProps) {
    const props = mergeProps({
        tabIndex: 0,
        className: 'radio-group',
        role: 'radiogroup'
    } satisfies Partial<RadioGroupProps>, rest)

    return asChild ? <Slot.Root {...props} /> : <div {...props} />
}