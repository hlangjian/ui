import { instanceOf } from "./instanceof"

export function isImageBitmapSourceAvailable(source: ImageBitmapSource) {
    switch (true) {
        case source instanceof HTMLImageElement: return source.complete && source.naturalWidth > 0
        case source instanceof SVGImageElement: return source.getBBox().width > 0
        case source instanceof HTMLVideoElement: return source.readyState >= 2 && source.videoWidth > 0
        case source instanceof Blob: return source.size > 0
        case source instanceof VideoFrame: return true
        case instanceOf(source, HTMLCanvasElement, OffscreenCanvas, ImageData, ImageBitmap): return source.width > 0
        default: throw Error('Unknown ImageBitmapSource type')
    }
}