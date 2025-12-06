import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import config from '../server/config.ts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            include: ['crypto', 'stream', 'vm'],
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
        })
    ],
    build: {
        sourcemap: true,
        outDir: "." + config.data_path + '/page_compiled',
    },
})
