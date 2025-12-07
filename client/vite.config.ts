import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import config from '../server/config.ts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { execSync } from 'child_process'
import fs from 'node:fs/promises'

const gitHash = execSync('git rev-parse --short HEAD')
    .toString()
    .trim()
const gitFullHash = execSync('git rev-parse HEAD')
    .toString()
    .trim()
const gitBranch = execSync('git rev-parse --abbrev-ref HEAD')
    .toString()
    .trim()
const versionEnv = {
    define: {
        __APP_VERSION__: JSON.stringify(JSON.parse(await fs.readFile('package.json', 'utf-8')).version),
        __GIT_HASH__: JSON.stringify(gitHash),
        __GIT_HASH_FULL__: JSON.stringify(gitFullHash),
        __GIT_BRANCH__: JSON.stringify(gitBranch),
        __BUILD_TIME__: JSON.stringify(new Date().toLocaleString('zh-CN')),
    }
}

function gitHashPlugin() {
    return {
        name: 'git-hash-plugin',
        config() {
            return versionEnv
        }
    }
}

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
        }),
        gitHashPlugin(),
    ],
    build: {
        sourcemap: true,
        outDir: "." + config.data_path + '/page_compiled',
    },
})
