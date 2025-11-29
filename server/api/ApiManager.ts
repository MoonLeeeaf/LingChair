import HttpServerLike from '../typedef/HttpServerLike.ts'
import UserApi from "./UserApi.ts"
import ChatApi from "./ChatApi.ts"
import * as SocketIo from "socket.io"
import ApiCallbackMessage from "./ApiCallbackMessage.ts"
import EventCallbackFunction from "../typedef/EventCallbackFunction.ts"
import BaseApi from "./BaseApi.ts"
import DataWrongError from "./DataWrongError.ts"
import chalk from "chalk"
import EventStorer from "./EventStorer.ts";

function stringifyNotIncludeArrayBuffer(value: any) {
    return JSON.stringify(value, (_k, v) => {
        if (v?.type == 'Buffer') {
            return {
                type: 'Buffer',
                data: '[...binary data omitted...]'
            }
        }
        return v
    })
}

export default class ApiManager {
    static httpServer: HttpServerLike
    static socketIoServer: SocketIo.Server
    static event_listeners: { [key: string]: EventCallbackFunction } = {}
    static apis_instance: { [key: string]: BaseApi } = {}
    static initServer(httpServer: HttpServerLike, socketIoServer: SocketIo.Server) {
        this.httpServer = httpServer
        this.socketIoServer = socketIoServer
    }
    static getHttpServer() {
        return this.httpServer
    }
    static getSocketIoServer() {
        return this.socketIoServer
    }
    static initAllApis() {
        this.apis_instance = {
            user: new UserApi(),
            chat: new ChatApi(),
        }
    }
    static addEventListener(name: string, func: EventCallbackFunction) {
        this.event_listeners[name] = func
    }
    static clients: { [key: string]: { [key: string]: SocketIo.Socket<SocketIo.DefaultEventsMap, SocketIo.DefaultEventsMap, SocketIo.DefaultEventsMap, any> } } = {}
    static checkUserIsOnline(userId: string) {
        return this.getUserClientSockets(userId) != null && Object.keys(this.getUserClientSockets(userId)).length > 0
    }
    /**
     * 獲取用戶所有的客戶端表 (格式遵循 設備ID_當前Session)
     */
    static getUserClientSockets(userId: string) {
        return this.clients[userId]
    }
    static initEvents() {
        const io = this.socketIoServer

        io.on('connection', (socket) => {
            // TODO: fix ip == undefined
            // https://github.com/denoland/deno/blob/7938d5d2a448b876479287de61e9e3b8c6109bc8/ext/node/polyfills/net.ts#L1713
            const ip = socket.conn.remoteAddress

            const deviceId = socket.handshake.auth.device_id as string
            const sessionId = socket.handshake.auth.session_id as string

            const clientInfo = {
                userId: '',
                deviceId,
                sessionId,
                ip,
                socket,
            }

            socket.on('disconnect', (_reason) => {
                if (clientInfo.userId == '')
                    console.log(chalk.yellow('[断]') + ` ${ip} disconnected`)
                else {
                    console.log(chalk.green('[断]') + ` ${ip} disconnected`)
                    delete this.clients[clientInfo.userId][deviceId + '_' + sessionId]
                    if (Object.keys(this.clients[clientInfo.userId]).length == 0)
                        EventStorer.getInstanceForUser(clientInfo.userId).clearEvents()
                }
            })
            console.log(chalk.yellow('[连]') + ` ${ip} connected`)

            socket.on("The_White_Silk", async (name: string, args: { [key: string]: unknown }, callback_: (ret: ApiCallbackMessage) => void) => {
                function callback(ret: ApiCallbackMessage) {
                    console.log(chalk.blue('[回]') + ` ${ip} <- ${ret.code == 200 ? chalk.green(ret.msg) : chalk.red(ret.msg)} [${ret.code}]${ret.data ? (' <extras: ' + stringifyNotIncludeArrayBuffer(ret.data) + '>') : ''}`)
                    return callback_(ret)
                }
                async function checkIsPromiseAndAwait(value: Promise<unknown> | unknown) {
                    if (value instanceof Promise)
                        return await value
                    return value
                }
                try {
                    if (name == null || args == null) return callback({
                        msg: "Invalid request.",
                        code: 400
                    })
                    console.log(chalk.red('[收]') + ` ${ip} -> ${chalk.yellow(name)} <args: ${stringifyNotIncludeArrayBuffer(args)}>`)

                    return callback(await checkIsPromiseAndAwait(this.event_listeners[name]?.(args, clientInfo)) || {
                        code: 501,
                        msg: "Not implmented",
                    })
                } catch (e) {
                    const err = e as Error
                    console.log(chalk.yellow('[坏]') + ` ${err.message} (${err.stack})`)
                    try {
                        callback({
                            code: err instanceof DataWrongError ? 400 : 500,
                            msg: "错误: " + err.message
                        })
                    } catch (_e) { }
                }
            })
        })
    }
}
