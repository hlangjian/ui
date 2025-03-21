import type { Preview } from '@storybook/react'
import { QueryProvider } from '@joyfourl/ui'
import "./preview.css"
import React from 'react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: Story => (
    <QueryProvider>
      <Story />
    </QueryProvider>
  )
};

export default preview;