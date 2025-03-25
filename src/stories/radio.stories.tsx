import { RadioButton } from "@/components/radio/radio-button"
import { RadioGroup } from "@/components/radio/radio-group"
import { useRadio } from "@/components/radio/use-radio"
import { defineStore } from "@/utils/define-store"
import { Meta } from "@storybook/react"

export default {
    component: RadioDemo
} satisfies Meta

const { Provider } = defineStore(() => {
    const radio = useRadio({ key: 'key', defaultValue: 'apple' })
    return radio
})

function RadioDemo() {
    return (
        <Provider>
            <RadioGroup className="flex flex-col gap-2 rounded p-2">
                {['apple', 'pear', 'orange', 'banana'].map(o => <RadioButton store-key="key" key={o} value={o}>{o}</RadioButton>)}
            </RadioGroup>
        </Provider>
    )
}

export const Default = {}