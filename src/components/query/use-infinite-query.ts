import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { DefaultError, InfiniteData, QueryKey, UseInfiniteQueryOptions, useInfiniteQuery as useTanInfiniteQuery } from '@tanstack/react-query'

export interface useInfiniteOptions<TQueryFnData, TPageParam, TQueryKey extends QueryKey = QueryKey, TError = DefaultError, TData = InfiniteData<TQueryFnData>> extends UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey, TPageParam> {

}

export function useInfiniteQuery<TQueryFnData, TPageParam, TQueryKey extends QueryKey, TError = DefaultError, TData extends InfiniteData<TQueryFnData> = InfiniteData<TQueryFnData>>(options: useInfiniteOptions<TQueryFnData, TPageParam, TQueryKey, TError, TData>) {

    const { isFetching, data, fetchNextPage, fetchPreviousPage, ...rest } = useTanInfiniteQuery(options)

    const { ref: nextObserverRef, inView: nextObserverInView } = useInView()

    const { ref: previousObserverRef, inView: previousObserverInView } = useInView()

    useEffect(() => {
        if (isFetching) return
        if (nextObserverInView) fetchNextPage()
        else if (previousObserverInView) fetchPreviousPage()
    }, [previousObserverInView, nextObserverInView, isFetching, fetchNextPage, fetchPreviousPage])

    return { data, nextObserverRef, previousObserverRef, isFetching, fetchNextPage, fetchPreviousPage, nextObserverInView, previousObserverInView, ...rest }
}