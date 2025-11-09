import { defineConfig } from 'vite'
import deno from '@deno/vite-plugin'
import react from '@vitejs/plugin-react'
import config from '../server/config.ts'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), deno()],
    build: {
        sourcemap: true,
        outDir: "." + config.data_path + '/page_compiled',
        minify: 'terser',
        cssMinify: 'lightningcss',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('mdui')) {
                            return 'mdui'
                        }
                        if (id.includes('crypto-js')) {
                            return 'cryptojs'
                        }
                        if (id.includes('split.js')) {
                            return 'splitjs'
                        }
                        if (id.includes('marked')) {
                            return 'marked'
                        }
                        return 'vendor'
                    }
                    return 'main'
                },
            }
        }
    },
})
