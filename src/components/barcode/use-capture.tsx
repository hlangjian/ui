import { useCallback, useState } from "react";
import { captureImage, CaptureImageOptions } from "./camera";

export function useCapture() {
    const [dataUrl, setDataUrl] = useState<undefined | string>(undefined)

    const capture = useCallback((options: CaptureImageOptions) => setDataUrl(captureImage(options)), [])

    const clear = useCallback(() => setDataUrl(undefined), [])

    return { capture, clear, dataUrl }
}