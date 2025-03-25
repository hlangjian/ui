import { Clipboard } from "@/components/clipboard/clipboard"
import { Meta } from "@storybook/react"
import { ClipboardCheckIcon, ClipboardCopyIcon } from "lucide-react"

export default {
    component: Clipboard
} satisfies Meta

export const Default = {
    render: () => (
        <div className="flex flex-row gap-2 items-center justify-center">
            <input className="rounded ring min-w-32" id="clipboard-target" />
            <Clipboard
                target="clipboard-target"
                feedback={<ClipboardCheckIcon />}
            >
                <ClipboardCopyIcon />
            </Clipboard>
        </div>
    )
}