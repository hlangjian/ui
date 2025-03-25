import { defineConfig } from 'tsup'

export default defineConfig({
    target: 'es6',
    format: 'esm',
    dts: true,
    clean: true,
    publicDir: true,
    keepNames: true,
    entry: ['index.ts']
})
