import { instanceOf } from '@/utils/instanceof'

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
        video.srcObject = null
    }
}

export interface CaptureImageOptions {
    source: CanvasImageSource
    height?: number
    width?: number
}

export function captureImage(options: CaptureImageOptions) {
    const size = getImageSourceSize(options.source)
    const { source, height = size.height, width = size.width } = options

    const canvas = document.createElement('canvas')
    canvas.height = height
    canvas.width = width

    const context = canvas.getContext('2d')
    if (context == null) throw Error('cannot create 2d context')

    context.drawImage(source, 0, 0, canvas.width, canvas.height)

    const data = canvas.toDataURL('image/png')
    canvas.remove()
    return data
}

export function getImageSourceSize(source: CanvasImageSource): { width: number, height: number } {
    switch (true) {
        case source instanceof HTMLImageElement: return { width: source.naturalWidth, height: source.naturalHeight }
        case source instanceof HTMLVideoElement: return { width: source.videoWidth, height: source.videoHeight }
        case source instanceof SVGImageElement: return { width: source.width.baseVal.value, height: source.height.baseVal.value }
        case instanceOf(source, HTMLCanvasElement, ImageBitmap, OffscreenCanvas): return { width: source.width, height: source.height }
        default: return { width: 0, height: 0 }
    }
}

export async function getVideoDevices() {

    const devices = await navigator.mediaDevices.enumerateDevices()

    const videoDevices = devices.filter(device => device.kind === 'videoinput')

    const availableDevices: Array<{ deviceId: string, minWidth: number, maxWidth: number, minHeight: number, maxHeight: number }> = []

    for (const device of videoDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: device.deviceId } })
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities()
        availableDevices.push({ deviceId: device.deviceId, ...getCapabilitiesSize(capabilities) })
        stream.getTracks().forEach(o => o.stop())
    }

    return availableDevices
}

export function getCapabilitiesSize(capabilities: MediaTrackCapabilities) {
    const { width, height } = capabilities
    return {
        minWidth: width?.min ?? 0,
        maxWidth: width?.max ?? 0,
        minHeight: height?.min ?? 0,
        maxHeight: height?.max ?? 0
    }
}
