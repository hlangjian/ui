import { ButtonHTMLAttributes, DetailedHTMLProps } from "react"
import { useRadioSnapshot } from "./use-radio"
import { mergeProps } from "@/utils/merge-props"
import { Slot } from "radix-ui"

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