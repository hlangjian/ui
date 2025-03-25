import { ButtonHTMLAttributes, DetailedHTMLProps } from "react"
import { getPaginationStore } from "./use-pagination"
import { mergeProps } from "@/utils/merge-props"
import { Slot } from 'radix-ui'

export interface PaginationTriggerProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    step: number
    "store-key": string
    asChild?: boolean
}

export function PaginationTrigger({ step, "store-key": key, asChild = false, ...rest }: PaginationTriggerProps) {
    const store = getPaginationStore(key)
    const props = mergeProps({
        type: 'button',
        onPointerDown: () => store.setPage(page => page + step),
        className: 'pagination-trigger'
    } satisfies Partial<PaginationTriggerProps>, rest)
    return asChild ? <Slot.Root {...props} /> : <button {...props} />
}