import readline from 'node:readline'
import process from "node:process"
import chalk from "chalk"
import child_process from "node:child_process"
import createLingChairServer from "./server.ts"
import config from "./config.ts"

const { httpServer } = await createLingChairServer()

httpServer.listen(config.server.listen)
console.log(chalk.green(`API & Web 服务已启动, 端口为 ${config.server.listen.port}`))
function help() {
    console.log(chalk.yellow("输入 b 或者执行 deno task build 以编译前端"))
}
help()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
rl.on('line', (text) => {
    if (text == 'b') {
        console.log(chalk.green("重新编译..."))
        child_process.spawnSync("deno", ["task", "build"], {
            stdio: [process.stdin, process.stdout, process.stderr]
        })
        help()
    }
})
