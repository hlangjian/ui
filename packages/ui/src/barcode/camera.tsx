import { createDebounceCache, DebounceCacheOptions } from "./scanner"

export const DefaultMediaTrackConstraints: MediaTrackConstraints = {
    facingMode: 'environment'
}

export async function getCamera(constraints: MediaTrackConstraints = DefaultMediaTrackConstraints) {
    return await navigator.mediaDevices.getUserMedia({ video: constraints })
}

export function connectMediaStream(video: HTMLVideoElement, mediaStream: MediaStream) {
    video.srcObject = mediaStream
    video.play()
    return () => {
        mediaStream.getTracks().forEach(o => o.stop())
        video.srcObject = null
    }
}

export interface CreateBarcodeCacheOptions extends Omit<DebounceCacheOptions<DetectedBarcode>, 'getKey'> { }

export function createBarcodeCache(options?: CreateBarcodeCacheOptions) {
    const { cache, update } = createDebounceCache({
        getKey: (barcode: DetectedBarcode) => barcode.rawValue,
        ...options
    })

    return {
        cache, update,
        get barcodes() {
            return [...cache.values().filter(o => o.confidence > 0.8).map(o => o.value)]
        }
    }
}

export function requestAnimation(fn: (next: () => unknown) => unknown) {
    let running = true
    const loop = () => { if (running) requestAnimationFrame(() => fn(loop)) }
    loop()
    return () => { running = false }
}