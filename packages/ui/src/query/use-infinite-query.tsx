import { mergeProps } from "@joyfourl/utils"
import { QueryKey, DefaultError, InfiniteData, UseInfiniteQueryOptions, useInfiniteQuery as useTanInfiniteQuery } from "@tanstack/react-query"
import { DetailedHTMLProps, HTMLAttributes, useCallback, useEffect } from "react"
import { useInView } from "react-intersection-observer";

export interface useInfiniteOptions<TQueryFnData, TPageParam, TQueryKey extends QueryKey = QueryKey, TError = DefaultError, TData = InfiniteData<TQueryFnData>> extends UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey, TPageParam> {

}

export function useInfiniteQuery<TQueryFnData, TPageParam, TQueryKey extends QueryKey, TError = DefaultError, TData extends InfiniteData<TQueryFnData> = InfiniteData<TQueryFnData>>(options: useInfiniteOptions<TQueryFnData, TPageParam, TQueryKey, TError, TData>) {

    const { isFetching, data, fetchNextPage, fetchPreviousPage, ...rest } = useTanInfiniteQuery(options)

    const { ref: nextObserverRef, inView: nextObserverInView } = useInView()

    const { ref: previousObserverRef, inView: previousObserverInView } = useInView()

    const NextObserver = useCallback(() => <div ref={nextObserverRef} />, [nextObserverRef])
    const PreviousObserver = useCallback(() => <div ref={previousObserverRef} />, [previousObserverRef])

    useEffect(() => {
        if (isFetching) return
        if (nextObserverInView) fetchNextPage()
        else if (previousObserverInView) fetchPreviousPage()
    }, [previousObserverInView, nextObserverInView, isFetching])

    return { data, NextObserver, PreviousObserver, isFetching, fetchNextPage, fetchPreviousPage, nextObserverInView, previousObserverInView, ...rest }
}

interface HeadlessInfiniteScrollProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
    isFetching: boolean
    fetchNextPage: () => unknown
    fetchPreviousPage: () => unknown
    threshold?: number
}

export function HeadlessInfiniteScroll(props: HeadlessInfiniteScrollProps) {
    const { isFetching, fetchNextPage, fetchPreviousPage, threshold, ...rest } = props

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