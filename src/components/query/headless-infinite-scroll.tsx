import { mergeProps } from "@/utils/merge-props"
import { useInView } from "react-intersection-observer";
import { DetailedHTMLProps, HTMLAttributes } from "react"

interface HeadlessInfiniteScrollProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
    isFetching: boolean
    fetchNextPage: () => unknown
    fetchPreviousPage: () => unknown
    threshold?: number
}

export function HeadlessInfiniteScroll(props: HeadlessInfiniteScrollProps) {
    const { isFetching, ...rest } = props

    const { ref: nextObserverRef, inView: nextObserverInView } = useInView()

    const { ref: previousObserverRef, inView: previousObserverInView } = useInView()

    const { children, ...subProps } = mergeProps({}, rest)

    return (
        <div {...subProps}>
            {previousObserverInView && isFetching && <div>loading previous page</div>}
            <div ref={previousObserverRef} />
            {children}
            <div ref={nextObserverRef} />
            {nextObserverInView && isFetching && <div>loading next page</div>}
        </div>
    )
}