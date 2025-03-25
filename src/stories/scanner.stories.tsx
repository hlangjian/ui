import { drawPolygones, getCenterPoint, Point2D } from "@/components/barcode/draw-utils"
import { useBarcodeDetector } from "@/components/barcode/use-barcode-detector"
import { useCamera } from "@/components/barcode/use-camera"
import { useCapture } from "@/components/barcode/use-capture"
import { Meta } from "@storybook/react"
import { InfoIcon } from "lucide-react"
import { useState } from "react"

export default {
    component: BarcodeScanner
} satisfies Meta

export const Default = {
    render() {
        return 'BarcodeDetector' in window ? <BarcodeScanner /> : <BarcodeScanner />
    }
}

function BarcodeScanner() {

    const [canvas, setCanvas] = useState<null | HTMLCanvasElement>(null)

    const { setCamera, camera } = useCamera()

    const { getBarcodes } = useBarcodeDetector({
        source: camera,
        action: barcodes => {
            if (canvas) drawPolygones(canvas, barcodes.map(o => o.cornerPoints))
        },
        fps: 30
    })

    const { capture, dataUrl, clear } = useCapture()

    const [image, setImage] = useState<null | HTMLImageElement>(null)

    const [centers, setCenters] = useState<Point2D[]>([])

    return (
        <div className="flex flex-col gap-4">
            {!dataUrl && (
                <div className="relative">
                    <video ref={setCamera} />
                    <button className="rounded bg-blue-50 hover:bg-blue-500 transition absolute z-50" onClick={() => camera && capture({ source: camera })}>Click me</button>
                    <canvas ref={setCanvas} className="absolute w-full top-0 left-0 ring ring-yellow-500 z-50" width={camera?.videoWidth} height={camera?.videoHeight} />
                </div>
            )}

            {dataUrl && (
                <div className="relative">
                    <img src={dataUrl} ref={setImage} onLoad={() => {
                        const xRate = image && image.naturalWidth !== 0 ? image.width / image.naturalWidth : 1
                        const yRate = image && image.naturalHeight !== 0 ? image.height / image.naturalHeight : 1
                        const polygons = getBarcodes().map(o => o.cornerPoints)
                        setCenters(polygons.map(getCenterPoint).map(o => ({ x: o.x * xRate, y: o.y * yRate })))
                    }} />
                    <button className="rounded bg-blue-50 hover:bg-blue-500 transition absolute z-50" onClick={clear}>Click me</button>
                    <canvas ref={setCanvas} className="absolute w-full top-0 left-0 ring ring-yellow-500" width={image?.naturalWidth} height={image?.naturalHeight} />
                    {centers.map((o, i) => (
                        <div key={i} style={{ left: o.x + 'px', top: o.y + 'px' }}
                            className="rounded absolute z-50 bg-blue-700/85 gap-2 px-3 py-2 text-blue-100 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
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
