import { Buffer } from "node:buffer"
import User from "../data/User.ts"
import BaseApi from "./BaseApi.ts"
import TokenManager from "./TokenManager.ts"
import ChatPrivate from "../data/ChatPrivate.ts"
import Chat from "../data/Chat.ts"
import chalk from "chalk"
import ApiManager from "./ApiManager.ts"
import EventStorer from "./EventStorer.ts";

export default class UserApi extends BaseApi {
    override getName(): string {
        return "User"
    }
    override onInit(): void {
        // 驗證
        this.registerEvent("User.auth", (args, clientInfo) => {
            if (this.checkArgsMissing(args, ['access_token'])) return {
                msg: "参数缺失",
                code: 400,
            }
            const { deviceId, ip, socket, sessionId } = clientInfo
            try {
                const access_token = TokenManager.decode(args.access_token as string)

                if (access_token.expired_time < Date.now()) return {
                    msg: "登录令牌失效",
                    code: 401,
                }
                if (!access_token.author || !User.findById(access_token.author)) return {
                    msg: "账号不存在",
                    code: 401,
                }
                if (access_token.device_id != deviceId) return {
                    msg: "验证失败",
                    code: 401,
                }

                clientInfo.userId = access_token.author
                console.log(chalk.green('[验]') + ` ${access_token.author} authed on Client ${deviceId} (ip = ${ip})`)
                const deviceSession = deviceId + '_' + sessionId
                if (ApiManager.clients[clientInfo.userId] == null) ApiManager.clients[clientInfo.userId] = {
                    [deviceSession]: socket
                }
                else ApiManager.clients[clientInfo.userId][deviceSession] = socket

                // 事件恢复
                console.log(EventStorer.getInstanceForUser(access_token.author).getEvents(deviceSession))
                for (const event of EventStorer.getInstanceForUser(access_token.author).getEvents(deviceSession))
                        this.emitToClient(socket, event.event_name, event.data, access_token.author, deviceSession)

                return {
                    msg: "成功",
                    code: 200,
                }
            } catch (e) {
                const err = e as Error
                if (err.message.indexOf("JSON") != -1)
                    return {
                        msg: "无效的用户令牌",
                        code: 401,
                    }
                else
                    throw e
            }
        })
        // 刷新访问令牌
        this.registerEvent("User.refreshAccessToken", (args, clientInfo) => {
            if (this.checkArgsMissing(args, ['refresh_token'])) return {
                msg: "参数缺失",
                code: 400,
            }
            const { deviceId } = clientInfo
            try {
                const refresh_token = TokenManager.decode(args.refresh_token as string)

                if (refresh_token.expired_time < Date.now()) return {
                    msg: "登录令牌失效",
                    code: 401,
                }
                if (!refresh_token.author || !User.findById(refresh_token.author)) return {
                    msg: "账号不存在",
                    code: 401,
                }
                if (refresh_token.device_id != deviceId) return {
                    msg: "验证失败",
                    code: 401,
                }

                const user = User.findById(refresh_token.author) as User

                return {
                    msg: "成功",
                    code: 200,
                    data: {
                        access_token: TokenManager.make(user, null, deviceId)
                    }
                }
            } catch (e) {
                const err = e as Error
                if (err.message.indexOf("JSON") != -1)
                    return {
                        msg: "无效的用户令牌",
                        code: 401,
                    }
                else
                    throw e
            }
        })
        // 登錄
        this.registerEvent("User.login", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['account', 'password'])) return {
                msg: "参数缺失",
                code: 400,
            }
            if (this.checkArgsEmpty(args, ['account', 'password'])) return {
                msg: "参数不得为空",
                code: 400,
            }

            const user = User.findByAccount(args.account as string) as User
            if (user == null) return {
                msg: "账号或密码错误",
                code: 400,
            }

            if (user.getPassword() == args.password) return {
                msg: "成功",
                code: 200,
                data: {
                    refresh_token: TokenManager.make(user, null, deviceId, 'refresh_token'),
                    access_token: TokenManager.make(user, null, deviceId),
                },
            }

            return {
                msg: "账号或密码错误",
                code: 400,
            }
        })
        // 注冊
        this.registerEvent("User.register", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['nickname', 'password'])) return {
                msg: "参数缺失",
                code: 400,
            }
            if (this.checkArgsEmpty(args, ['nickname', 'password'])) return {
                msg: "参数不得为空",
                code: 400,
            }

            const username: string | null = args.username as string
            const nickname: string = args.nickname as string
            const password: string = args.password as string

            const user = User.create(username, password, nickname, null)

            return {
                msg: "成功",
                code: 200,
                data: {
                    user_id: user.bean.id
                },
            }
        })
        // 登錄
        this.registerEvent("User.resetPassword", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'old_password', 'new_password'])) return {
                msg: "参数缺失",
                code: 400,
            }
            if (this.checkArgsEmpty(args, ['token', 'old_password', 'new_password'])) return {
                msg: "参数不得为空",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }
            const user = User.findById(token.author) as User

            if (user.getPassword() == args.old_password) {
                user.setPassword(args.new_password as string)
                return {
                    msg: "成功",
                    code: 200,
                    data: {
                        refresh_token: TokenManager.make(user, null, deviceId, 'refresh_token'),
                        access_token: TokenManager.make(user, null, deviceId),
                    },
                }
            }

            return {
                msg: "账号或密码错误",
                code: 400,
            }
        })
        /*
         * ================================================
         *                    個人資料
         * ================================================
         */
        // 更新頭像
        this.registerEvent("User.setAvatar", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['file_hash', 'token'])) return {
                msg: "参数缺失",
                code: 400,
            }
            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            // const avatar: Buffer = args.avatar as Buffer
            const user = User.findById(token.author)
            user!.setAvatarFileHash(args.file_hash as string) //.setAvatar(avatar)

            return {
                msg: "成功",
                code: 200,
            }
        })
        // 更新資料
        this.registerEvent("User.updateProfile", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const user = User.findById(token.author)
            if (args.nickname != null)
                user!.setNickName(args.nickname as string)
            if (args.username != null)
                user!.setUserName(args.username as string)

            return {
                msg: "成功",
                code: 200,
            }
        })
        // 獲取用戶信息
        this.registerEvent("User.getMyInfo", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const user = User.findById(token.author)

            return {
                msg: "成功",
                code: 200,
                data: {
                    username: user!.getUserName(),
                    nickname: user!.getNickName(),
                    avatar_file_hash: user!.getAvatarFileHash() ? user!.getAvatarFileHash() : null,
                    id: token.author,
                }
            }
        })
        // 獲取聯絡人列表
        this.registerEvent("User.getMyAllChats", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const user = User.findById(token.author) as User
            const list = user.getAllChatsList()

            return {
                msg: "成功",
                code: 200,
                data: {
                    all_chats: list.map((id) => {
                        const chat = Chat.findById(id)
                        return {
                            id,
                            type: chat?.bean.type,
                            title: chat?.getTitle(user) || "未知",
                            avatar_file_hash: chat?.getAvatarFileHash(user) ? chat?.getAvatarFileHash(user) : undefined
                        }
                    })
                }
            }
        })
        // 獲取最近对话列表
        this.registerEvent("User.getMyRecentChats", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const user = User.findById(token.author) as User
            const recentChats = user.getRecentChats()
            const recentChatsList: any[] = []
            for (const [chatId, content] of recentChats) {
                const chat = Chat.findById(chatId)
                recentChatsList.push({
                    content,
                    id: chatId,
                    title: chat?.getTitle(user) || "未知",
                    avatar_file_hash: chat?.getAvatarFileHash(user) ? chat?.getAvatarFileHash(user) : undefined
                })
            }

            return {
                msg: "成功",
                code: 200,
                data: {
                    recent_chats: recentChatsList.reverse(),
                }
            }
        })
        // 獲取聯絡人列表
        this.registerEvent("User.getMyFavouriteChats", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const user = User.findById(token.author) as User
            const contacts = user.getFavouriteChats()
            contacts.push(ChatPrivate.getChatIdByUsersId(token.author, token.author))

            return {
                msg: "成功",
                code: 200,
                data: {
                    contacts_list: contacts.map((id) => {
                        const chat = Chat.findById(id)
                        return {
                            id,
                            type: chat?.bean.type,
                            title: chat?.getTitle(user) || "未知",
                            avatar_file_hash: chat?.getAvatarFileHash(user) ? chat?.getAvatarFileHash(user) : undefined
                        }
                    })
                }
            }
        })
        // 添加聯絡人
        this.registerEvent("User.addFavouriteChats", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'targets'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            let fail = 0
            const user = User.findById(token.author) as User
            for (const target of (args.targets as string[])) {
                const chat = Chat.findById(target) || Chat.findByName(target)
                const targetUser = User.findByAccount(target) as User
                if (chat)
                    user!.addFavouriteChat(chat.bean.id)
                else if (targetUser) {
                    const privChat = ChatPrivate.findOrCreateForPrivate(user, targetUser)
                    user!.addFavouriteChat(privChat.bean.id)
                } else {
                    fail++
                }
            }

            return {
                msg: "添加成功 (失败 " + fail + " 个)",
                code: 200,
            }
        })
        // 添加聯絡人
        this.registerEvent("User.removeFavouriteChats", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'targets'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const user = User.findById(token.author) as User
            user.removeFavouriteChats(args.targets as string[])

            return {
                msg: "成功",
                code: 200,
            }
        })
        /*
         * ================================================
         *                    公開資料
         * ================================================
         */
        // 獲取用戶信息
        this.registerEvent("User.getInfo", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'target'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const user = User.findById(args.target as string)
            if (user == null) return {
                code: 404,
                msg: "用戶不存在",
            }

            return {
                msg: "成功",
                code: 200,
                data: {
                    username: user!.getUserName(),
                    nickname: user!.getNickName(),
                    avatar_file_hash: user!.getAvatarFileHash() ? user!.getAvatarFileHash() : null,
                    id: user.bean.id,
                }
            }
        })
    }
}