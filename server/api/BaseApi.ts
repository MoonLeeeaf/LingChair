import EventCallbackFunction from "../typedef/EventCallbackFunction.ts"
import ApiManager from "./ApiManager.ts"
import { CallMethod, ClientEvent } from './ApiDeclare.ts'
import User from "../data/User.ts"
import Token from "./Token.ts"
import TokenManager from './TokenManager.ts'
import * as SocketIo from "socket.io"
import EventStorer from "./EventStorer.ts"
import chalk from "chalk"

export default abstract class BaseApi {
    abstract getName(): string
    constructor() {
        this.onInit()
    }
    abstract onInit(): void
    checkArgsMissing(args: { [key: string]: unknown }, names: string[]) {
        for (const k of names)
            if (!(k in args))
                return true
        return false
    }
    checkArgsEmpty(args: { [key: string]: unknown }, names: string[]) {
        for (const k of names)
            if (k in args && args[k] == '')
                return true
        return false
    }
    checkToken(token: Token, deviceId: string) {
        return TokenManager.checkToken(token, deviceId)
    }
    registerEvent(name: CallMethod, func: EventCallbackFunction) {
        if (!name.startsWith(this.getName() + ".")) throw Error("注冊的事件應該與接口集合命名空間相匹配: " + name)
        ApiManager.addEventListener(name, func)
    }
    emitToClient(client: SocketIo.Socket, name: ClientEvent, args: { [key: string]: unknown }, user: User | string, deviceSession: string) {
        console.log(chalk.magenta('[发]') + ` ${client.handshake.address} <- ${chalk.yellow(name)} ${' <extras: ' + JSON.stringify(args) + '>'}`)
        client.timeout(5000).emit("The_White_Silk", name, args, (err: Error) => {
            if (err) EventStorer.getInstanceForUser(user).addEvent(name, args, deviceSession)
        })
    }
    boardcastToUsers(users: string[], name: ClientEvent, args: { [key: string]: unknown }) {
        for (const user of users) {
            if (ApiManager.checkUserIsOnline(user)) {
                const sockets = ApiManager.getUserClientSockets(user)
                for (const deviceSession of Object.keys(sockets))
                    if (sockets[deviceSession].connected)
                        this.emitToClient(sockets[deviceSession], name, args, user, deviceSession)
                    else
                        EventStorer.getInstanceForUser(user).addEvent(name, args, deviceSession)
            } else
                EventStorer.getInstanceForUser(user).clearEvents()
        }
    }
}
