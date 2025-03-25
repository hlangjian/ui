import { useEffect, useMemo, useState } from "react"
import { createBarcodeCache, createBarcodeDetector } from "./barcode-detector"
import { requestAnimation } from "@/utils/request-animation"
import { isImageBitmapSourceAvailable } from "@/utils/is-image-source-available"
import { reorder, smoothPoints } from "./draw-utils"
import { DetectedBarcode } from "barcode-detector/ponyfill"

export interface UseBarcodeDetectorOptions {
    source: ImageBitmapSource | null | undefined
    action?: (barcodes: DetectedBarcode[]) => unknown
    fps?: number
}

export function useBarcodeDetector(options: UseBarcodeDetectorOptions) {

    const { source, action, fps = Infinity } = options

    const [{ update, getBarcodes }] = useState(() => createBarcodeCache({
        compute: (newValue, oldValue) => ({ ...newValue, cornerPoints: smoothPoints(reorder(newValue.cornerPoints, oldValue.cornerPoints), oldValue.cornerPoints, 0.3) }),
    }))

    const [detector] = useState(() => createBarcodeDetector())

    const actionRef = useMemo(() => action, [action])

    useEffect(requestAnimation(next => {
        if (source == null) return
        if (isImageBitmapSourceAvailable(source) == false) return next()

        detector.detect(source).then(o => {
            update(o)
            if (actionRef) actionRef(getBarcodes())
            next()
        })
    }, fps), [source, action])

    return { getBarcodes, detector }
}