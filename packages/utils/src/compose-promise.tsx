export function composePromise<T>(getPromise: () => Promise<T>, ...pipeline: Array<(getPromise: () => Promise<T>) => () => Promise<T>>): () => Promise<T> {
    return pipeline.reduce((previous, wrapped) => wrapped(previous), getPromise)
}