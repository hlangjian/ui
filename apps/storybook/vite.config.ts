import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, '../stories') }]
  },
  server: {
    watch: {
      ignored: ['!**/node_modules/@joyfourl/ui/**']
    }
  },
  optimizeDeps: {
    exclude: ['@joyfourl/ui'],
  },
})
