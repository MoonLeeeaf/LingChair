import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import config from '../server/config.ts'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        sourcemap: true,
        outDir: "." + config.data_path + '/page_compiled',
    }
})
