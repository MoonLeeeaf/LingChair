// deno-lint-ignore-file no-explicit-any
import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import crypto from 'node:crypto'
import { CallMethod, ClientEvent } from './ApiDeclare.ts'
import ApiCallbackMessage from './ApiCallbackMessage.ts'
import User from "./User.ts"
import UserMySelf from "./UserMySelf.ts"
import CallbackError from "./CallbackError.ts"

export { 
    User,
    UserMySelf,
}

export default class LingChairClient {
    declare client: Socket
    declare access_token: string
    declare refresh_token?: string
    constructor(args: {
        server_url: string
        device_id: string,
        io?: Partial<ManagerOptions & SocketOptions>
    }) {
        this.client = io(args.server_url, {
            transports: ["polling", "websocket", "webtransport"],
            ...args.io,
            auth: {
                ...args.io?.auth,
                device_id: args.device_id,
                session_id: crypto.randomUUID(),
            },
        })
        this.client.on("The_White_Silk", (name: string, data: unknown, _callback: (ret: unknown) => void) => {
            try {
                if (name == null || data == null) return
                this.events[name]?.forEach((v) => v(data))
            } catch (e) {
                console.error(e)
            }
        })
    }
    connect() {
        this.client.connect()
    }
    disconnect() {
        this.client.disconnect()
    }
    reconnect() {
        this.disconnect()
        this.connect()
    }
    invoke(method: CallMethod, args: object = {}, timeout: number = 10000): Promise<ApiCallbackMessage> {
        return new Promise((resolve) => {
            this.client!.timeout(timeout).emit("The_White_Silk", method, args, (err: Error, res: ApiCallbackMessage) => {
                // 错误处理
                if (err) return resolve({
                    code: -1,
                    msg: err.message,
                })
                resolve(res)
            })
        })
    }
    events: { [key: string]: ((data: any) => void)[] } = {}
    on(eventName: ClientEvent, func: (data: any) => void) {
        if (this.events[eventName] == null)
            this.events[eventName] = []
        if (this.events[eventName].indexOf(func) == -1)
            this.events[eventName].push(func)
    }
    off(eventName: ClientEvent, func: (data: any) => void) {
        if (this.events[eventName] == null)
            this.events[eventName] = []
        const index = this.events[eventName].indexOf(func)
        if (index != -1)
            this.events[eventName].splice(index, 1)
    }
    async auth(args: {
        refresh_token?: string,
        access_token?: string,
        account?: string,
        password?: string,
    }) {
        try {
            this.authOrThrow(args)
            return true
        } catch (_) {
            return false
        }
    }
    async authOrThrow(args: {
        refresh_token?: string,
        access_token?: string,
        account?: string,
        password?: string,
    }) {
        if ((!args.access_token && !args.refresh_token) && (!args.account && !args.password))
            throw new Error('Access/Refresh token or account & password required')

        this.refresh_token = args.refresh_token

        let access_token = args.access_token
        if (!access_token && args.refresh_token) {
            const re = await this.invoke('User.refreshAccessToken', {
                refresh_token: args.refresh_token,
            })
            if (re.code == 200) 
                access_token = re.data!.access_token as string | undefined
            else 
                throw new CallbackError(re)
        }

        if (!access_token && (args.account && args.password)) {
            const re = await this.invoke('User.login', {
                account: args.account,
                password: crypto.createHash('sha256').update(args.password).digest('hex'),
            })
            if (re.code == 200) 
                access_token = re.data!.access_token as string | undefined
            else 
                throw new CallbackError(re)
        }

        const re = await this.invoke('User.auth', {
            access_token: access_token
        })
        if (re.code == 200) 
            this.access_token = access_token as string
        else 
            throw new CallbackError(re)
    }
    async register(args: {
        nickname: string,
        username?: string,
        password: string,
    }) {
        try {
            this.registerOrThrow(args)
            return true
        } catch (_) {
            return false
        }
    }
    async registerOrThrow({
        nickname,
        username,
        password,
    }: {
        nickname: string,
        username?: string,
        password: string,
    }) {
        const re = await this.invoke('User.register', {
            nickname,
            username,
            password,
        })
        if (re.code != 200)
            throw new CallbackError(re)
    }
}
