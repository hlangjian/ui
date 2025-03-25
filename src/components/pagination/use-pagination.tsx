import { createGlobalStore } from "@/utils/create-global-store"
import { useState } from "react"

export interface PaginationOptions {
    initialPage?: number
    count: number
    key: string
}

export interface PaginationStore {
    page: number
    count: number
    setPage: (page: number | ((page: number) => number)) => void
}

export const { usePersist: usePaginationPersist, useSnapshot: usePaginationSnapshot, getStore: getPaginationStore } = createGlobalStore<PaginationStore>()

export function usePagination(options: PaginationOptions) {
    const { count, initialPage = 0, key } = options
    const [page, setPage] = useState(initialPage)

    const setPageSafe = (value: number | ((page: number) => number)) => {
        setPage(page => {
            const actualValue = typeof value == 'function' ? value(page) : value
            return actualValue < 0 ? 0 : actualValue > count - 1 ? count - 1 : actualValue
        })
    }

    return usePaginationPersist(key, { page, count, setPage: setPageSafe })
}