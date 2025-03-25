import { mergeProps } from "@/utils/merge-props"
import { Slot } from "radix-ui"
import { DetailedHTMLProps, HTMLAttributes } from "react"

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