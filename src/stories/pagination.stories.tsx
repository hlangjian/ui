import { PaginationListButton } from "@/components/pagination/pagination-list-button"
import { PaginationTrigger } from "@/components/pagination/pagination-trigger"
import { usePagination } from "@/components/pagination/use-pagination"
// import { randBrand, randNumber, randProductName, randUuid, randFutureDate } from "@ngneat/falso"
import { Meta } from "@storybook/react"
import { range } from "es-toolkit"
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export default {
    component: () => <div></div>
} satisfies Meta

export const Default = { render: Render }

function Render() {

    usePagination({ key: 'key', count: 100 })

    return (
        <div className="flex flex-row justify-center gap-1 items-stretch">
            <PaginationTrigger store-key="key" step={-1}>
                <ChevronLeftIcon />
            </PaginationTrigger>

            {range(10).map(o => <PaginationListButton key={o} order={o} listSize={10} currentIndex={3} store-key="key" />)}

            <PaginationTrigger store-key="key" step={1}>
                <ChevronRightIcon />
            </PaginationTrigger>
        </div>
    )
}

// async function fetchMedicalSupplies(count: number) {

//     const supplies = Array.from({ length: count }, () => ({
//         id: randUuid(),
//         name: randProductName(),
//         brand: randBrand(),
//         quantity: randNumber({ min: 1, max: 500 }),
//         expiryDate: randFutureDate().toISOString()
//     }))

//     return new Promise<typeof supplies>((resolve) => setTimeout(() => resolve(supplies), 500))
// }