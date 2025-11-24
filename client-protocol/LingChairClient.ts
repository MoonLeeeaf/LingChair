// deno-lint-ignore-file no-explicit-any
import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import crypto from 'node:crypto'
import { CallMethod, ClientEvent } from './ApiDeclare.ts'
import ApiCallbackMessage from './ApiCallbackMessage.ts'
import User from "./User.ts"
import UserMySelf from "./UserMySelf.ts"
import CallbackError from "./CallbackError.ts"
import Chat from "./Chat.ts"
import { CallableMethodBeforeAuth } from "lingchair-internal-shared"

export {
    User,
    Chat,
    UserMySelf,
}

export default class LingChairClient {
    declare client: Socket
    declare access_token: string
    declare server_url: string
    declare device_id: string
    declare refresh_token?: string
    declare auto_fresh_token: boolean
    declare auth_cache: {
        refresh_token?: string,
        access_token?: string,
        account?: string,
        password?: string,
    }
    constructor(args: {
        server_url: string
        device_id: string,
        io?: Partial<ManagerOptions & SocketOptions>
        auto_fresh_token?: boolean
    }) {
        this.server_url = args.server_url
        this.auto_fresh_token = args.auto_fresh_token || false
        this.device_id = args.device_id
        this.client = io(args.server_url, {
            transports: ["polling", "websocket", "webtransport"],
            ...args.io,
            auth: {
                ...args.io?.auth,
                device_id: this.device_id,
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
                if (CallableMethodBeforeAuth.indexOf(method) == -1 && res.code == 401 && this.auto_fresh_token) {
                    if (this.auth_cache)
                        this.auth(this.auth_cache).then((re) => {
                            if (!re) resolve(res)
                            this.invoke(method, args, timeout).then((re) => resolve(re))
                        })
                    else
                        resolve(res)
                } else
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
            await this.authOrThrow(args)
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

        this.auth_cache = args

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
            await this.registerOrThrow(args)
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
    async uploadFile({
        chatId,
        fileData,
        fileName,
    }: { fileName: string, fileData: ArrayBuffer | Blob | Response, chatId?: string }) {
        const form = new FormData()
        form.append("file",
            fileData instanceof ArrayBuffer
                ? new File([fileData], fileName, { type: 'application/octet-stream' })
                : (
                    fileData instanceof Blob ? fileData :
                        new File([await fileData.arrayBuffer()], fileName, { type: 'application/octet-stream' })
                )
        )
        form.append('file_name', fileName)
        chatId && form.append('chat_id', chatId)
        const url = new URL(this.server_url)
        const re = await fetch(({
            'ws:': 'http:',
            'wss:': 'https:',
            'http:': 'http:',
            'https:': 'https:',
        })[url.protocol] || 'http:' + '//' + url.host + '/upload_file', {
            method: 'POST',
            headers: {
                "Token": this.access_token,
                "Device-Id": this.device_id,
            } as HeadersInit,
            body: form,
            credentials: 'omit',
        })
        const text = await (await re.blob()).text()
        let json
        try {
            json = JSON.parse(text)
        // deno-lint-ignore no-empty
        } catch (_) { }
        if (!re.ok) throw new CallbackError({
            ...(json == null ? {
                msg: text
            } : json),
            code: re.status,
        } as ApiCallbackMessage)
        return json.data.hash as string
    }
}
