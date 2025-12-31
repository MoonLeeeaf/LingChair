import { Buffer } from "node:buffer"
import Chat from "../data/Chat.ts"
import FileManager from "../data/FileManager.ts"
import MessagesManager from "../data/MessagesManager.ts"
import User from "../data/User.ts"
import UserChatLinker from "../data/UserChatLinker.ts"
import ApiManager from "./ApiManager.ts"
import BaseApi from "./BaseApi.ts"
import TokenManager from "./TokenManager.ts"
import ChatPrivate from "../data/ChatPrivate.ts"
import ChatGroup from "../data/ChatGroup.ts"
import GroupSettingsBean from "../data/GroupSettingsBean.ts"
import AdminPermissions from "../data/AdminPermissions.ts"

export default class ChatApi extends BaseApi {
    override getName(): string {
        return "Chat"
    }
    override onInit(): void {
        /**
         * ======================================================
         *                        对话消息
         * ======================================================
         */
        /**
         * 發送訊息
         * @param token 令牌
         * @param target 目標對話
         * @param text 消息内容
         */
        this.registerEvent("Chat.sendMessage", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'target', 'text'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const chat = Chat.findById(args.target as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }
            if (!UserChatLinker.checkUserIsLinkedToChat(token.author, chat!.bean.id)) return {
                code: 403,
                msg: "用户无权访问此对话",
            }

            const msg = {
                text: args.text as string,
                time: Date.now(),
                user_id: token.author,
            }
            const id = MessagesManager.getInstanceForChat(chat).addMessage(msg)

            const users: string[] = UserChatLinker.getChatMembers(chat.bean.id)
            users.forEach((id) => {
                const userInst = User.findById(id)
                userInst?.updateRecentChat(chat.bean.id, args.text as string)
            })
            const m = {
                ...msg,
                id,
                chat_id: chat.bean.id,
            }
            this.boardcastToUsers(users, 'Client.onMessage', {
                chat: chat.bean.id,
                msg: m
            })

            return {
                code: 200,
                msg: "成功",
                data: {
                    message: m,
                }
            }
        })
        /**
         * 拉取歷史訊息
         * @param token 令牌
         * @param target 目標對話
         * @param page 頁面
         */
        this.registerEvent("Chat.getMessageHistory", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'target'])) return {
                msg: "参数缺失",
                code: 400,
            }
            if (args.page == null && args.offset == null) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const chat = Chat.findById(args.target as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }
            if (!UserChatLinker.checkUserIsLinkedToChat(token.author, chat!.bean.id)) return {
                code: 403,
                msg: "用户无权访问此对话",
            }

            return {
                code: 200,
                msg: "成功",
                data: {
                    messages: MessagesManager.getInstanceForChat(chat)[args.page ? 'getMessagesWithPage' : 'getMessagesWithOffset'](null, (args.page ? args.page : args.offset) as number),
                },
            }
        })
        /**
         * ======================================================
         *                          对话成员
         * ======================================================
         */
        this.registerEvent("Chat.quit", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'chat_id', 'user_ids'])) return {
                msg: "参数缺失",
                code: 400,
            }
            const action = args.action as string

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const chat = Chat.findById(args.chat_id as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }
            if (!chat.checkUserIsAdmin(token.author)) return {
                code: 403,
                msg: "没有此权限",
            }

            const members = args.user_ids as string[]
            members.splice(members.indexOf(token.author))
            chat.removeMembers(members)

            return {
                code: 200,
                msg: '成功',
            }
        })
        this.registerEvent("Chat.removeMembers", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'chat_id', 'user_ids'])) return {
                msg: "参数缺失",
                code: 400,
            }
            const action = args.action as string

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const chat = Chat.findById(args.chat_id as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }
            if (!chat.checkUserIsAdmin(token.author)) return {
                code: 403,
                msg: "没有此权限",
            }

            const members = args.user_ids as string[]
            members.splice(members.indexOf(token.author))
            chat.removeMembers(members)

            return {
                code: 200,
                msg: '成功',
            }
        })
        /**
         * ======================================================
         *                       加入对话申请
         * ======================================================
         */
        /**
         * 获取所有的加入对话申请
         * @param token 令牌
         * @param target ID
         */
        this.registerEvent("Chat.getJoinRequests", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'target'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const chat = Chat.findById(args.target as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }
            if (!chat.checkUserIsAdmin(token.author)) return {
                code: 403,
                msg: "没有此权限",
            }

            return {
                code: 200,
                msg: '成功',
                data: {
                    join_requests: chat.getJoinRequests().map((v) => {
                        const user = User.findById(v.user_id as string)
                        return {
                            user_id: user?.bean.id,
                            reason: v.reason,
                            nickname: user!.getNickName(),
                            // TODO: 这个得删掉, 应该用 nickname
                            title: user!.getNickName(),
                            avatar_file_hash: user!.getAvatarFileHash() ? user!.getAvatarFileHash() : null,
                        }
                    }),
                }
            }
        })
        /**
         * 处理加入对话申请
         * @param token 令牌
         */
        this.registerEvent("Chat.processJoinRequest", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'chat_id', 'user_id', 'action'])) return {
                msg: "参数缺失",
                code: 400,
            }
            const action = args.action as string

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const chat = Chat.findById(args.chat_id as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }
            if (!chat.checkUserIsAdmin(token.author)) return {
                code: 403,
                msg: "没有此权限",
            }

            const admin = User.findById(token.author)

            if (chat.getJoinRequests().map((v) => v.user_id).indexOf(args.user_id as string) != -1) {
                const user = User.findById(args.user_id as string)
                if (user == null) {
                    chat.removeJoinRequests([
                        args.user_id as string,
                    ])
                } else {
                    if (action == 'accept') {
                        const msg = `${user.getNickName()} 经 ${admin?.getNickName()} 批准加入了对话`
                        MessagesManager.getInstanceForChat(chat).addSystemMessage(msg)
                        const users: string[] = UserChatLinker.getChatMembers(chat.bean.id)
                        this.boardcastToUsers(users, 'Client.onMessage', {
                            chat: chat.bean.id,
                            msg: {
                                text: msg,
                                time: Date.now(),
                            },
                        })
                        chat.addMembers([
                            args.user_id as string,
                        ])
                    }
                    if (action == 'accept' || action == 'remove')
                        chat.removeJoinRequests([
                            args.user_id as string,
                        ])
                }
            }

            return {
                code: 200,
                msg: '成功',
            }
        })
        /**
         * 加入群组
         * @param token 令牌
         * @param target ID
         */
        this.registerEvent("Chat.sendJoinRequest", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'target'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const chat = Chat.findById(args.target as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }
            if (chat.bean.type == 'group') {
                const settings = ChatGroup.fromChat(chat).getSettings()
                if (settings.settings.allow_new_member_join)
                    chat.addJoinRequest(token.author, args.reason as string)
                else
                    return {
                        code: 403,
                        msg: "该对话不允许加入请求",
                    }
            }

            return {
                code: 200,
                msg: '成功',
                data: {
                    chat_id: chat.bean.id,
                }
            }
        })
        /**
         * ======================================================
         *                       创建对话
         * ======================================================
         */
        /**
         * 获取私聊的 ChatId
         * @param token 令牌
         * @param target 目標用户
         */
        this.registerEvent("Chat.getOrCreatePrivateChat", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'target'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }
            const user = User.findById(token.author) as User
            const targetUser = User.findById(args.target as string) as User
            if (targetUser == null) {
                return {
                    msg: "找不到用户",
                    code: 404,
                }
            }
            const chat = ChatPrivate.findOrCreateForPrivate(user, targetUser)

            return {
                code: 200,
                msg: '成功',
                data: {
                    id: chat.bean.id,
                    name: chat.bean.name,
                    type: chat.bean.type,
                    title: chat.getTitle(user),
                    avatar_file_hash: chat.getAvatarFileHash(user) ? chat.getAvatarFileHash(user) : undefined,
                    settings: JSON.parse(chat.bean.settings),
                    is_member: true,
                    is_admin: true,
                }
            }
        })
        /**
         * 创建群组
         * @param token 令牌
         * @param title 名称
         * @param [name] 群组别名
         */
        this.registerEvent("Chat.createGroup", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'title'])) return {
                msg: "参数缺失",
                code: 400,
            }
            if (this.checkArgsEmpty(args, ['title'])) return {
                msg: "参数不得为空",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }
            const user = User.findById(token.author) as User

            const chat = ChatGroup.createGroup(args.name as string)
            chat.setTitle(args.title as string)
            chat.addMembers([
                user.bean.id,
            ])
            chat.addAdmin(user.bean.id, [
                AdminPermissions.OWNER,
            ])
            user.addFavouriteChat(chat.bean.id)
            MessagesManager.getInstanceForChat(chat).addSystemMessage("群组已创建")

            return {
                code: 200,
                msg: '成功',
                data: {
                    // TODO: 移除这个
                    // 并重构原 Web 客户端所引用的内容
                    chat_id: chat.bean.id,

                    id: chat.bean.id,
                    name: chat.bean.name,
                    type: chat.bean.type,
                    title: chat.getTitle(),
                    avatar_file_hash: chat.getAvatarFileHash() ? chat.getAvatarFileHash() : undefined,
                    settings: {
                        ...JSON.parse(chat.bean.settings),
                        // 下面两个比较特殊, 用于群设置
                        group_name: chat.bean.name,
                        group_title: chat.getTitle(),
                    },
                    is_member: UserChatLinker.checkUserIsLinkedToChat(token.author, chat!.bean.id),
                    is_admin: chat.checkUserIsAdmin(token.author),
                }
            }
        })
        /**
         * ======================================================
         *                       对话信息
         * ======================================================
         */
        /**
         * 獲取對話訊息
         * @param token 令牌
         * @param target 目標對話
         */
        this.registerEvent("Chat.getInfo", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'target'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const chat = Chat.findById(args.target as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }

            // 私聊
            if (chat!.bean.type == 'private') {
                if (!UserChatLinker.checkUserIsLinkedToChat(token.author, chat!.bean.id)) return {
                    code: 403,
                    msg: "用户无权访问此对话",
                }
                const mine = User.findById(token.author) as User

                return {
                    code: 200,
                    msg: "成功",
                    data: {
                        id: args.target as string,
                        name: chat.bean.name,
                        type: chat.bean.type,
                        title: chat.getTitle(mine),
                        avatar_file_hash: chat.getAvatarFileHash(mine) ? chat.getAvatarFileHash(mine) : undefined,
                        settings: JSON.parse(chat.bean.settings),
                        is_member: true,
                        is_admin: true,
                    }
                }
            }
            if (chat!.bean.type == 'group') {
                return {
                    code: 200,
                    msg: "成功",
                    data: {
                        id: args.target as string,
                        name: chat.bean.name,
                        type: chat.bean.type,
                        title: chat.getTitle(),
                        avatar_file_hash: chat.getAvatarFileHash() ? chat.getAvatarFileHash() : undefined,
                        settings: {
                            ...JSON.parse(chat.bean.settings),
                            // 下面两个比较特殊, 用于群设置
                            group_name: chat.bean.name,
                            group_title: chat.getTitle(),
                        },
                        is_member: UserChatLinker.checkUserIsLinkedToChat(token.author, chat!.bean.id),
                        is_admin: chat.checkUserIsAdmin(token.author),
                    }
                }
            }

            return {
                code: 404,
                msg: "找不到对话",
            }
        })
        // 更新頭像
        this.registerEvent("Chat.setAvatar", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['file_hash', 'token', 'target'])) return {
                msg: "参数缺失",
                code: 400,
            }
            const token = TokenManager.decode(args.token as string)

            const user = User.findById(token.author) as User

            const chat = Chat.findById(args.target as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }

            if (chat.bean.type == 'group')
                if (chat.checkUserIsAdmin(user.bean.id)) {
                    chat.setAvatarFileHash(args.file_hash as string)
                } else
                    return {
                        code: 403,
                        msg: "没有此权限",
                    }

            return {
                msg: "成功",
                code: 200,
            }
        })
        /**
         * 更新设定 (包括资料)
         * @param token 令牌
         * @param title 名称
         * @param [id] 群组 ID
         */
        this.registerEvent("Chat.updateSettings", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'target', 'settings'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }
            const user = User.findById(token.author) as User

            const chat = Chat.findById(args.target as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }

            if (chat.bean.type == 'group')
                if (chat.checkUserIsAdmin(user.bean.id)) {
                    ChatGroup.fromChat(chat).getSettings().update(args.settings as GroupSettingsBean)

                    const settings = args.settings as any
                    if (settings.group_title != null)
                        chat.setTitle(settings.group_title)
                    if (settings.group_name != null)
                        chat.setName(settings.group_name == '' ? null : settings.group_name)
                } else
                    return {
                        code: 403,
                        msg: "没有此权限",
                    }

            return {
                code: 200,
                msg: '成功',
            }
        })
        /**
         * 从私聊获取对方的 UserId
         * @param token 令牌
         * @param target 目標对话
         */
        this.registerEvent("Chat.getAnotherUserIdFromPrivate", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'target'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const user = User.findById(token.author) as User

            const chat = Chat.findById(args.target as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }
            if (!UserChatLinker.checkUserIsLinkedToChat(token.author, chat!.bean.id)) return {
                code: 403,
                msg: "用户无权访问此对话",
            }

            if (chat.bean.type == 'private')
                return {
                    code: 200,
                    msg: '成功',
                    data: {
                        user_id: chat.getAnotherUserForPrivate(user)?.bean.id
                    }
                }

            return {
                code: 403,
                msg: "非私聊对话",
            }
        })
        /**
         * 获取所有的加入对话申请
         * @param token 令牌
         * @param target ID
         */
        this.registerEvent("Chat.getMembers", (args, { deviceId }) => {
            if (this.checkArgsMissing(args, ['token', 'target'])) return {
                msg: "参数缺失",
                code: 400,
            }

            const token = TokenManager.decode(args.token as string)
            if (!this.checkToken(token, deviceId)) return {
                code: 401,
                msg: "令牌无效",
            }

            const chat = Chat.findById(args.target as string)
            if (chat == null) return {
                code: 404,
                msg: "对话不存在",
            }
            if (!UserChatLinker.checkUserIsLinkedToChat(token.author, chat!.bean.id)) return {
                code: 403,
                msg: "用户无权访问此对话",
            }

            return {
                code: 200,
                msg: '成功',
                data: {
                    members: chat.getMembersList().map((v) => {
                        const user = User.findById(v)
                        return user && {
                            id: user?.bean.id,
                            nickname: user.getNickName(),
                            username: user.getUserName(),
                            avatar_file_hash: user.getAvatarFileHash(),
                        }
                    }),
                }
            }
        })
    }
}