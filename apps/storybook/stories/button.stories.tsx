import type { Meta, StoryObj } from '@storybook/react'

export default {
    component: () => <button />
} satisfies Meta

export const Story: StoryObj = {
    render: () => <button className='bg-blue-500'>Hello, world</button>
}