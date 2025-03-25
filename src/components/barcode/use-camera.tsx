import { useEffect, useMemo, useState } from "react"
import { connectMediaStream, getCamera } from "./camera"
import { useAsync } from "@/utils/use-async"

export const useCamera = (constraints?: MediaTrackConstraints) => {

    const [camera, setCamera] = useState<HTMLVideoElement | null>(null)

    const callback = useMemo(() => () => getCamera(constraints), [constraints])

    const { status, value: media, isAvaliable, start } = useAsync(callback, { autoStart: false })

    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (camera == null) return
        if (isAvaliable(media, status) == false) return start()

        camera.addEventListener('loadedmetadata', () => setReady(true), { once: true })
        const disconnect = connectMediaStream(camera, media)

        return () => {
            disconnect()
            setReady(false)
        }
    }, [camera, media, status])

    useEffect(() => () => {
        if (media) media.getTracks().forEach(o => o.stop())
    }, [])

    return { status, media, isAvaliable, setCamera, camera, ready }
}
