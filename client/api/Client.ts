import { io, Socket } from 'socket.io-client'
import { CallMethod, ClientEvent, CallableMethodBeforeAuth } from './ApiDeclare.ts'
import ApiCallbackMessage from './ApiCallbackMessage.ts'
import User from "./client_data/User.ts"
import data from "../Data.ts"
import { checkApiSuccessOrSncakbar, snackbar } from "../ui/snackbar.ts"
import randomUUID from "../randomUUID.ts"

class Client {
    static sessionId = randomUUID()
    static myUserProfile?: User
    static socket?: Socket
    static events: { [key: string]: ((data: unknown) => void)[] } = {}
    static connected = false
    static connect() {
        if (data.device_id == null)
            data.device_id = randomUUID()
        this.socket?.disconnect()
        this.socket && delete this.socket
        this.socket = io({
            transports: ['websocket'],
            auth: {
                device_id: data.device_id,
                session_id: this.sessionId,
            },
        })
        this.socket!.on("connect", () => {
            const auth = async () => {
                this.connected = true
                const s = snackbar({
                    message: '重新验证中...',
                    placement: 'top',
                    autoCloseDelay: 0,
                })
                let i = 1
                const id = setInterval(() => {
                    s.textContent = `重新验证中... (${i}s)`
                    i++
                }, 1000)
                const re = await this.auth(data.access_token as string, 6000)
                if (re.code != 200) {
                    if (re.code == -1) {
                        auth()
                    } else if (re.code != 401 && re.code != 400) {
                        const s2 = checkApiSuccessOrSncakbar(re, "重新验证失败")
                        s2!.autoCloseDelay = 0
                        s2!.action = "重试"
                        s2!.addEventListener('action-click', () => {
                            auth()
                        })
                        this.socket!.once("disconnect", () => {
                            s2!.open = false
                        })
                    }
                }
                clearTimeout(id)
                s.open = false
            }
            auth()
        })
        this.socket!.on("disconnect", () => {
            this.connected = false
            const s = snackbar({
                message: '重新连接服务器中...',
                placement: 'top',
                autoCloseDelay: 0,
            })
            let i = 1
            const id = setInterval(() => {
                s.textContent = `重新连接服务器中... (${i}s)`
                i++
                this.socket!.connect()
            }, 1000)
            this.socket!.once('connect', () => {
                s.open = false
                clearTimeout(id)
            })
        })
        this.socket!.on("The_White_Silk", (name: string, data: unknown, callback: (ret: unknown) => void) => {
            try {
                if (name == null || data == null) return
                this.events[name]?.forEach((v) => v(data))
            } catch (e) {
                console.error(e)
            }
        })
    }
    static invoke(method: CallMethod, args: object = {}, timeout: number = 10000, refreshAndRetryLimit: number = 3, forceRefreshAndRetry: boolean = false): Promise<ApiCallbackMessage> {
        // 在 未初始化 / 未建立连接且调用非可调用接口 的时候进行延迟
        if (this.socket == null || (!this.connected && !CallableMethodBeforeAuth.includes(method))) {
            return new Promise((reslove) => {
                setTimeout(async () => reslove(await this.invoke(method, args, timeout)), 500)
            })
        }
        // 反之, 返回 Promise
        return new Promise((resolve) => {
            this.socket!.timeout(timeout).emit("The_White_Silk", method, args, async (err: Error, res: ApiCallbackMessage) => {
                // 错误处理
                if (err) return resolve({
                    code: -1,
                    msg: err.message.indexOf("timed out") != -1 ? "请求超时" : err.message,
                })
                // 在特殊的方法之中, 不予进行: 令牌刷新并重试
                // 附带 retry 次数限制
                if (
                    (
                        forceRefreshAndRetry ||
                        (
                            !CallableMethodBeforeAuth.includes(method)
                            && res.code == 401
                        )
                    ) && refreshAndRetryLimit > 0
                ) {
                    const token = await this.refreshAccessToken()
                    if (token) {
                        data.access_token = token
                        data.apply()
                        resolve(await this.invoke(method, {
                            ...args,
                            [method == "User.auth" ? "access_token" : "token"]: token,
                        }, timeout, refreshAndRetryLimit - 1))
                    } else
                        resolve(res)
                } else
                    resolve(res)
            })
        })
    }
    static async refreshAccessToken() {
        const re = await this.invoke("User.refreshAccessToken", {
            refresh_token: data.refresh_token
        })
        return re.data?.access_token as string
    }
    static async auth(token: string, timeout?: number) {
        const re = await this.invoke("User.auth", {
            access_token: token
        }, timeout, 1, true)
        if (re.code == 200) {
            // 灵车: 你应该先 connected = true 再调用
            await this.updateCachedProfile()
            document.cookie = 'token=' + token
            document.cookie = 'device_id=' + data.device_id
        }
        return re
    }
    static async uploadFileLikeApi(fileName: string, fileData: ArrayBuffer | Blob | Response, chatId?: string) {
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
        const re = await fetch('./upload_file', {
            method: 'POST',
            headers: {
                "Token": data.access_token,
                "Device-Id": data.device_id,
            } as HeadersInit,
            body: form,
            credentials: 'omit',
        })
        return {
            ...await re.json(),
            code: re.status,
        } as ApiCallbackMessage
    }
    static async uploadFile(fileName: string, fileData: ArrayBuffer | Blob | Response, chatId?: string) {
        const re = await this.uploadFileLikeApi(fileName, fileData, chatId)
        if (re.code != 200) throw new Error(re.msg)
        return re.data!.hash as string
    }
    static async updateCachedProfile() {
        this.myUserProfile = (await Client.invoke("User.getMyInfo", {
            token: data.access_token
        })).data as unknown as User
    }
    static on(eventName: ClientEvent, func: (data: unknown) => void) {
        if (this.events[eventName] == null)
            this.events[eventName] = []
        if (this.events[eventName].indexOf(func) == -1)
            this.events[eventName].push(func)
    }
    static off(eventName: ClientEvent, func: (data: unknown) => void) {
        if (this.events[eventName] == null)
            this.events[eventName] = []
        const index = this.events[eventName].indexOf(func)
        if (index != -1)
            this.events[eventName].splice(index, 1)
    }
}

export default Client
