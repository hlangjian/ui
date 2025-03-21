import { ButtonHTMLAttributes, DetailedHTMLProps } from "react"
import { getPaginationStore, usePaginationSnapshot } from "./use-pagination"
import { mergeProps } from "@joyfourl/utils"
import { Slot } from "radix-ui"

export function computePageValue(page: number, count: number, order: number, total: number, currentIndex: number) {
    if (currentIndex >= total - 1) throw Error('anchor must < total - 1')

    const actualTotal = Math.min(count, total)

    const totalDelta = page - currentIndex < 0 ? currentIndex - page
        : page + actualTotal - currentIndex > count ? count + currentIndex - page - actualTotal
            : 0

    return page + order - currentIndex + totalDelta
}

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