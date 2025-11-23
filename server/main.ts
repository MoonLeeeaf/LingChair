import ApiManager from "./api/ApiManager.ts"
// @ts-types="npm:@types/express"
import express from 'express'
import * as SocketIo from 'socket.io'
import HttpServerLike from "./typedef/HttpServerLike.ts"
import config from './config.ts'
import http from 'node:http'
import https from 'node:https'
import readline from 'node:readline'
import process from "node:process"
import chalk from "chalk"
import child_process from "node:child_process"
import FileManager from "./data/FileManager.ts"
import path from "node:path"
import cookieParser from 'cookie-parser'
import fs from 'node:fs/promises'
// @ts-types="npm:@types/express-fileupload"
import fileUpload from 'express-fileupload'
import FileUploadMiddleware from "./fileupload-middleware.ts"

const app = express()
app.use('/', express.static(config.data_path + '/page_compiled'))
app.use(cookieParser())
app.get('/config.json', (req, res) => {
    res.send(config.client || {})
})
app.get('/uploaded_files/:hash', FileUploadMiddleware.checkAccessingUploadedFiles, (req, res) => {
    const file = FileManager.findByHash(req.params.hash as string)

    if (file == null) {
        return;
    }
    const fileName = encodeURIComponent(file!.getName()?.replaceAll('"', ''))
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`)
    res.setHeader('Content-Type', file!.getMime())
    res.sendFile(path.resolve(file!.getFilePath()))
    file.updateLastUsedTime()
})

await fs.mkdir(config.data_path + '/upload_cache', { recursive: true })
app.use(fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: config.data_path + '/upload_cache',
    abortOnLimit: true,
}))
app.post('/upload_file', FileUploadMiddleware.checkUploadedFile, async (req, res) => {
    const file = req.files?.file as fileUpload.UploadedFile
    const hash = (await FileManager.uploadFile(req.body.file_name, await fs.readFile(file.tempFilePath), req.body.chat_id)).getHash()

    res.status(200).send({
        msg: "success",
        data: {
            file_hash: hash,
        },
    })
})

const httpServer: HttpServerLike = (
    ((config.server.use == 'http') && http.createServer(app)) ||
    ((config.server.use == 'https') && https.createServer({
        ...config.server.https,
        key: await fs.readFile(config.server.https.key),
        cert: await fs.readFile(config.server.https.cert),
    }, app)) ||
    http.createServer(app)
)
const io = new SocketIo.Server(httpServer, {
    transports: ["polling", "websocket", "webtransport"],
})

ApiManager.initServer(httpServer, io)
ApiManager.initEvents()
ApiManager.initAllApis()

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
