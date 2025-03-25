import { ButtonHTMLAttributes, DetailedHTMLProps } from "react"
import { getPaginationStore, usePaginationSnapshot } from "./use-pagination"
import { mergeProps } from "@/utils/merge-props"
import { Slot } from "radix-ui"
import { computePageValue } from "./compute-page-value"

export interface PaginationListButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    order: number
    listSize: number
    currentIndex: number
    "store-key": string
    asChild?: boolean
}

export function PaginationListButton(props: PaginationListButtonProps) {
    const { order, listSize, currentIndex, "store-key": key, asChild = false, ...rest } = props

    const store = getPaginationStore(key)
    const snapshot = usePaginationSnapshot(key)

    const value = computePageValue(snapshot.page, snapshot.count, order, listSize, currentIndex)

    const subProps = mergeProps({
        className: "pagination-button",
        "aria-selected": value == snapshot.page ? true : undefined,
        onClick: () => store.setPage(value),
        children: value + 1
    } satisfies Partial<PaginationListButtonProps>, rest)

    if (snapshot.count > order) return asChild ? <Slot.Root {...subProps} /> : <button {...subProps} />
}