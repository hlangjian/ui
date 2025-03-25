import { MouseEventHandler, useRef, useState } from "react"

export type CopyMode = 'auto' | 'value' | 'data-value' | 'text-context'

export interface ClipboardOptions {
    target?: string | HTMLElement | null
    mode?: CopyMode
    timeout?: number
}

export function useClipboard(options: ClipboardOptions) {
    const { target, mode = 'auto', timeout = 1500 } = options

    const [copied, setCopy] = useState(false)

    const timer = useRef<ReturnType<typeof setTimeout>>(null)

    const onClick: MouseEventHandler = () => {
        const targetRef = typeof target == 'string' ? document.getElementById(target) : target
        if (!targetRef) return

        setCopy(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopy(false), timeout)

        switch (true) {
            case (mode == 'value' || mode == 'auto') && 'value' in targetRef && typeof targetRef.value == 'string':
                return navigator.clipboard.writeText(targetRef.value)

            case (mode == 'data-value' || mode == 'auto') && 'data-value' in targetRef && typeof targetRef['data-value'] == 'string':
                return navigator.clipboard.writeText(targetRef['data-value'])

            case (mode == 'text-context' || mode == 'auto') && targetRef.textContent != null:
                return navigator.clipboard.writeText(targetRef.textContent)

            default: {
                if (mode == 'auto') throw Error(`target: ${targetRef} is not a copyable item`)
                throw Error(`target: ${targetRef} cannot copy using ${mode} mode`)
            }
        }
    }

    return { onClick, copied }
}
