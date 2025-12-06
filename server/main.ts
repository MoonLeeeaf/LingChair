import chalk from "chalk"
import createLingChairServer from "./server.ts"
import config from "./config.ts"

const { httpServer } = await createLingChairServer()

httpServer.listen(config.server.listen)
console.log(chalk.green(`API & Web 服务已启动, 端口为 ${config.server.listen.port}`))
