
export function requestAnimation(fn: (next: () => void) => unknown, fps = Infinity) {
    let running = true
    let lastTimeStamp = performance.now()

    const loop = () => {
        if (running == false) return
        if (fps == Infinity) return requestAnimationFrame(() => fn(loop))

        const timestamp = performance.now()
        if (timestamp - lastTimeStamp > 1000 / fps) {
            lastTimeStamp = timestamp
            requestAnimationFrame(() => fn(loop))
        }
        else requestAnimationFrame(loop)
    }

    return () => {
        loop()
        return () => { running = false }
    }
}