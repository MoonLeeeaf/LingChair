import ApiManager from "./api/ApiManager.ts"
// @ts-types="npm:@types/express"
import express from 'express'
import * as SocketIo from 'socket.io'
import HttpServerLike from "./typedef/HttpServerLike.ts"
import config from './config.ts'
import http from 'node:http'
import https from 'node:https'
import FileManager from "./data/FileManager.ts"
import path from "node:path"
import cookieParser from 'cookie-parser'
import fs from 'node:fs/promises'
// @ts-types="npm:@types/express-fileupload"
import fileUpload from 'express-fileupload'
import FileUploadMiddleware from "./fileupload-middleware.ts"

export default async function createLingChairServer() {
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
    await fs.unlink(config.data_path + '/upload_cache')
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

    return {
        httpServer,
        expressApp: app,
        SocketIoServer: io,
    }
}
