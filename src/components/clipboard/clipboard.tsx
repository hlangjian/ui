import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react"
import { ClipboardOptions, useClipboard } from "./use-clipboard"
import { mergeProps } from "@/utils/merge-props"

export interface ClipboardProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, ClipboardOptions {
    feedback?: ReactNode
}

export function Clipboard({ target, mode, timeout, children, feedback, ...rest }: ClipboardProps) {
    const { onClick, copied } = useClipboard({ target, mode, timeout })
    const props = mergeProps({
        onPointerDown: onClick,
        children: copied && feedback ? feedback : children
    } satisfies Partial<ClipboardProps>, rest)
    return <button {...props} />
}