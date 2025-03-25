export interface DebounceCacheOptions<T> {
    getKey: (value: T) => string
    defaultConfidence?: number
    minConfidence?: number
    growthMin?: number
    growthMax?: number
    decayMin?: number
    decayMax?: number
    gamma?: number
    compute?: (newValue: T, oldValue: T) => T
}

function computeRates(confidence: number, growthMin = 0, growthMax = 1, decayMin = 0, decayMax = 1, gamma = 1) {
    confidence = Math.max(0, Math.min(1, confidence))

    const growthRate = growthMin + (growthMax - growthMin) * Math.pow(confidence, gamma)
    const decayRate = decayMax - (decayMax - decayMin) * Math.pow(confidence, gamma)

    return [growthRate, decayRate] as const
}

export function createDebounceCache<T>(options: DebounceCacheOptions<T>) {

    const { compute = value => value, getKey, defaultConfidence = 0.3, minConfidence = 0.1, growthMin = 0.1, growthMax = 1, decayMin = 0.1, decayMax = 1, gamma = 1 } = options

    const cache = new Map<string, { confidence: number, value: T }>()

    function update(items: T[]) {
        const keys = items.map(o => getKey(o))

        for (const item of items) {
            const key = getKey(item)
            if (cache.has(key)) {
                const cacheItem = cache.get(key)!
                const newConfidence = Math.min((1 + computeRates(cacheItem.confidence, growthMin, growthMax, decayMin, decayMax, gamma)[0]) * cacheItem.confidence, 1)
                cacheItem.confidence = newConfidence
                cacheItem.value = compute(item, cacheItem.value)
            }
            else cache.set(key, { confidence: defaultConfidence, value: item })
        }

        for (const key of cache.keys().filter(o => keys.includes(o) == false)) {
            const cacheItem = cache.get(key)!
            const newConfidence = (1 - computeRates(cacheItem.confidence, growthMin, growthMax, decayMin, decayMax, gamma)[1]) * cacheItem.confidence
            if (newConfidence < minConfidence) cache.delete(key)
            else cacheItem.confidence = newConfidence
        }
    }

    return { cache, update }
}