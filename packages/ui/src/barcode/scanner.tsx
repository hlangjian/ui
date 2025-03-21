import { Point2D } from "barcode-detector/ponyfill"

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
    confidence = Math.max(0, Math.min(1, confidence));

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

/**
 * 根据距离动态计算插值因子
 * @param distance 当前点与目标点的距离
 * @param baseSpeed 基础速率（可以调整以获得期望的效果）
 * @returns 返回 [0, 1] 范围内的插值因子
 */
export function computeAlpha(distance: number, baseSpeed: number): number {
    // 计算一个基于距离的插值因子，距离越大，alpha 越接近1
    // 这里简单采用：alpha = baseSpeed * distance，但最大值限制为1
    return Math.min(1, baseSpeed * distance);
}

/**
 * 对两个 Point2D 数组进行插值，插值速率与点间距离相关。
 * @param value 新的目标数组
 * @param oldValue 旧的数组
 * @param baseSpeed 控制速率的基础参数，数值越大速率越快
 * @param threshold 距离小于该值时直接使用新点
 * @returns 返回插值后的 Point2D 数组
 */
export function interpolatePoints(
    value: Point2D[],
    oldValue: Point2D[],
    baseSpeed: number = 0.05,
    threshold: number = 0.01
): Point2D[] {
    // 以两数组较短的长度为准，防止越界
    const len = Math.min(value.length, oldValue.length);
    const result: Point2D[] = [];

    for (let i = 0; i < len; i++) {
        const newPt = value[i];
        const oldPt = oldValue[i];
        const dx = newPt.x - oldPt.x;
        const dy = newPt.y - oldPt.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 如果点之间的距离足够小，直接返回新点
        if (distance < threshold) {
            result.push(newPt);
        } else {
            // 根据距离计算插值因子，距离越大，alpha 越大
            const alpha = computeAlpha(distance, baseSpeed);
            result.push({
                x: oldPt.x + alpha * dx,
                y: oldPt.y + alpha * dy
            });
        }
    }

    // 如果新数组比旧数组多，则把多出的部分直接追加
    if (value.length > len) {
        result.push(...value.slice(len));
    }

    return result;
}