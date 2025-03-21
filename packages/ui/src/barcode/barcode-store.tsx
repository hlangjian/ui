import { BarcodeDetector as BarcodeDetectorPonyfill, DetectedBarcode, Point2D } from "barcode-detector/ponyfill";
import { createDebounceCache } from "./scanner"

export function createBarcodeScanner() {
    return 'BarcodeDetector' in window ? new BarcodeDetector() : new BarcodeDetectorPonyfill()
}

export function requestAnimation(
    callback: (next: () => void) => unknown
) {
    const start = () => { requestAnimationFrame(() => callback(start)) }
    return start
}

interface BarcodeOptions {
    source: HTMLVideoElement
}

export function useBarcode(options: BarcodeOptions) {

    const { source } = options

    const detector = createBarcodeScanner()

    const { cache, update } = createDebounceCache({
        getKey: (barcode: DetectedBarcode) => barcode.rawValue,
        minConfidence: 0.1,
        gamma: 1,
        decayMin: 0.05,
        growthMax: 0.05
    })

    const getBarcodes = () => [...cache.values().filter(o => o.confidence > 0.8).map(o => o.value)]

    const start = () => {
        return requestAnimation(next => {
            if (source == null) return

            if (source.srcObject == null || source.readyState < 2) return next()

            detector.detect(source).then(o => {
                update(o)
                next()
            })
        })()
    }

    return { start, getBarcodes }
}

export function createBarcodeCache() {

    const { cache, update } = createDebounceCache({
        getKey: (barcode: DetectedBarcode) => barcode.rawValue,
        minConfidence: 0.1,
        gamma: 1,
        decayMin: 0.05,
        growthMax: 0.05
    })

    const getBarcodes = () => [...cache.values().filter(o => o.confidence > 0.8).map(o => o.value)]

    return { getBarcodes, update }
}


/**
 * 1. Get barcode detector
 * 2. Create barcodes debounce cache
 * 3. create updater from <video> source and cache
 * 4. 
 */