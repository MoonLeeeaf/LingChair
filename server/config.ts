import fs from 'node:fs/promises'
import chalk from 'chalk'
import { cwd } from "node:process"

const isCompilingClient = /client(\\|\/)?$/.test(cwd())
const prefix = isCompilingClient ? '.' : ''

const default_data_path = "./thewhitesilk_data"
let config = {
    data_path: default_data_path,
    salt: "TWS_Demo",
    aes_key: "01234567890123456",
    server: {
        use: "http",
        /**
         * used in server.listen()
         */
        listen: {
            port: 3601,
            host: null,
            /**
             * setting ipv6Only to true will disable dual-stack support, i.e., binding to host :: won't make 0.0.0.0 be bound.
             * 然而这在 deno 上没什么用, 不如设定 host 为 null
             */
            ipv6Only: false,
        },
        /**
         * used in https.createServer()
         */
        https: {
            key: default_data_path + '/key.pem',
            cert: default_data_path + '/cert.pem',
        },
    },
    client: {
        title: '铃之椅',
    },
}

try {
    config = JSON.parse(await fs.readFile(prefix + './thewhitesilk_config.json', 'utf-8'))
} catch (_e) {
    console.log(chalk.yellow("配置文件貌似不存在, 正在创建..."))
    await fs.writeFile(prefix + './thewhitesilk_config.json', JSON.stringify(config))
}

await fs.mkdir(prefix + config.data_path, { recursive: true })

export default config
