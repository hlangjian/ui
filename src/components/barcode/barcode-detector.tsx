import { createDebounceCache, DebounceCacheOptions } from "@/utils/debounce-cache"
import { BarcodeDetector as BarcodeDetectorPony } from 'barcode-detector/ponyfill'

export interface CreateBarcodeCacheOptions extends Omit<DebounceCacheOptions<DetectedBarcode>, 'getKey'> { }

export const DefaultBarcodeCacheOptions: CreateBarcodeCacheOptions = {
    gamma: 1,
    minConfidence: 0.1,
    defaultConfidence: 0.3,
    decayMin: 0.05,
    growthMin: 0.3,
    decayMax: 0.5,
    growthMax: 1
}

export function createBarcodeCache(options?: CreateBarcodeCacheOptions) {
    const { cache, update } = createDebounceCache({
        getKey: (barcode: DetectedBarcode) => barcode.rawValue,
        ...(DefaultBarcodeCacheOptions),
        ...options
    })

    return {
        cache, update,
        getBarcodes() {
            return [...cache.values().filter(o => o.confidence > 0.9).map(o => o.value)]
        }
    }
}

export function createBarcodeDetector(options?: BarcodeDetectorOptions): BarcodeDetector {
    return 'BarcodeDetector' in window ? new BarcodeDetector(options) : new BarcodeDetectorPony(options) as BarcodeDetector
}