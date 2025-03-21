"use client"

import { mergeRefs, useAsync } from "@joyfourl/utils";
import { BarcodeDetector as BarcodeDetectorPonyfill, DetectedBarcode, Point2D } from "barcode-detector/ponyfill";
import { useEffect, useMemo, useState } from "react";
import { createDebounceCache } from "./scanner";
import { InfoIcon } from 'lucide-react'

export function BarcodeScanner() {

    const { barcodes, setVideo, video } = useBarcodes()

    const { setVideo: setCamera } = useCamera()

    const polygons = barcodes.map(o => o.cornerPoints) as Point2D[][]

    const { setCanvas, canvas } = useCanvas(...polygons)

    const { capture, capturing, dataUrl, clear } = useCapture(video, video?.videoHeight, video?.videoWidth)

    const [image, setImage] = useState<null | HTMLImageElement>(null)

    const ref = mergeRefs(setVideo, setCamera)

    const xRate = image && image.naturalWidth !== 0 ? image.width / image.naturalWidth : 1
    const yRate = image && image.naturalHeight !== 0 ? image.height / image.naturalHeight : 1

    const centers = getCenters(...polygons).map(o => ({ x: o.x * xRate, y: o.y * yRate }))

    return (
        <div className="flex flex-col gap-4">
            {capturing == false && (
                <div className="relative">
                    <video ref={ref} />
                    <button className="rounded bg-blue-50 hover:bg-blue-500 transition absolute z-50" onClick={capture}>Click me</button>
                    <canvas ref={setCanvas} className="absolute w-full top-0 left-0 ring ring-yellow-500" width={video?.videoWidth} height={video?.videoHeight} />
                </div>
            )}

            {capturing && dataUrl && (
                <div className="relative">
                    <img src={dataUrl} ref={setImage} />
                    <button className="rounded bg-blue-50 hover:bg-blue-500 transition absolute z-50" onClick={clear}>Click me</button>
                    <canvas ref={setCanvas} className="absolute w-full top-0 left-0 ring ring-yellow-500" width={image?.naturalWidth} height={image?.naturalHeight} />
                    {centers.map((o, i) => (
                        <div
                            key={i}
                            className="rounded absolute z-50 bg-blue-700/85 gap-2 px-3 py-2 text-blue-100 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                            style={{ left: o.x + 'px', top: o.y + 'px' }}
                        >
                            <InfoIcon />
                            <span>
                                得宝Tempo
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

async function getDevices() {

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

function getCapabilitiesSize(capabilities: MediaTrackCapabilities) {
    const { width, height } = capabilities
    return {
        minWidth: width?.min ?? 0,
        maxWidth: width?.max ?? 0,
        minHeight: height?.min ?? 0,
        maxHeight: height?.max ?? 0
    }
}

export function useBarcodes() {
    const [detector] = useState(() => ('BarcodeDetector' in window) ? new BarcodeDetector() : new BarcodeDetectorPonyfill())

    const [video, setVideo] = useState<null | HTMLVideoElement>(null)

    const [barcodes, setBarcodes] = useState<DetectedBarcode[]>([])

    const { cache, update } = useMemo(() => createDebounceCache({
        getKey: (barcode: DetectedBarcode) => barcode.rawValue,
        minConfidence: 0.1,
        gamma: 1,
        decayMin: 0.05,
        growthMin: 0.05,
    }), [])

    useRequestAnimationFrame(next => {

        if (video == null) return

        if (video?.srcObject == null || video.readyState < 2) return next()

        detector.detect(video).then(o => {
            update(o)
            setBarcodes([...cache.values().filter(o => o.confidence > 0.8).map(o => o.value)])
            return next()
        })
    }, [video])

    return { detector, video, setVideo, barcodes }
}

const useRequestAnimationFrame = (callback: (next: () => void) => unknown, dependencies: readonly unknown[] = []) => useEffect(() => {
    let timer = null as null | number

    const run = () => timer = requestAnimationFrame(runner)

    const runner = () => requestAnimationFrame(() => callback(run))

    run()

    return () => { timer && cancelAnimationFrame(timer) }
}, dependencies)

const useCamera = () => {
    const [video, setVideo] = useState<null | HTMLVideoElement>(null)

    const { status, value: media, isAvaliable } = useAsync(getCamera)

    useEffect(() => {
        if (video == null || isAvaliable(media, status) == false) return

        video.srcObject = media
        video.play()

        return () => {
            media.getAudioTracks().forEach(o => o.stop())
            video.srcObject = null
        }

    }, [video, media, status])

    return { status, camera: media, isAvaliable, setVideo, video }
}

const getCamera = async () => await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }
})

function useCanvas(...polygons: Point2D[][]) {
    const [canvas, setCanvas] = useState<null | HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvas == null) return

        const ctx = canvas.getContext('2d')
        if (ctx == null) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        for (const points of polygons) {
            if (points.length < 1) continue
            ctx.beginPath()
            ctx.moveTo(points[0].x, points[0].y)
            points.slice(1).forEach(({ x, y }) => ctx.lineTo(x, y))
            ctx.closePath()
            ctx.strokeStyle = 'red'
            ctx.lineWidth = 2
            ctx.stroke()
        }

    }, [canvas, polygons])

    return { canvas, setCanvas }
}

const useCapture = (source: CanvasImageSource | null, height?: number, width?: number) => {

    const [capturing, setCapturing] = useState(false)

    const [dataUrl, setDataUrl] = useState<null | string>(null)

    const capture = () => {
        if (source == null) return

        const canvas = document.createElement('canvas')
        canvas.height = height ?? 320
        canvas.width = width ?? 240

        const ctx = canvas.getContext('2d')
        if (ctx == null) return

        ctx.drawImage(source, 0, 0, canvas.width, canvas.height)

        setDataUrl(canvas.toDataURL('image/png'))
        setCapturing(true)

        canvas.remove()
    }

    const clear = () => {
        setCapturing(false)
        setDataUrl(null)
    }

    return { dataUrl, capture, capturing, clear }
}

function getCenters(...polygons: Point2D[][]): Point2D[] {
    const centerPoints: Point2D[] = []
    for (const points of polygons) {
        if (points.length < 1) continue
        const x = points.map(o => o.x).reduce((sum, value) => sum + value, 0) / points.length
        const y = points.map(o => o.y).reduce((sum, value) => sum + value, 0) / points.length
        centerPoints.push({ x, y })
    }
    return centerPoints
}