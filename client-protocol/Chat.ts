import BaseClientObject from "./BaseClientObject.ts"
import BaseChatSettingsBean from "./bean/BaseChatSettingsBean.ts"
import ChatBean from "./bean/ChatBean.ts"
import JoinRequestBean from "./bean/JoinRequestBean.ts"
import MessageBean from "./bean/MessageBean.ts"
import CallbackError from "./CallbackError.ts"
import JoinRequest from "./JoinRequest.ts"
import LingChairClient from "./LingChairClient.ts"
import Message from "./Message.ts"

export default class Chat extends BaseClientObject {
    declare bean: ChatBean
    constructor(client: LingChairClient, bean: ChatBean) {
        super(client)
        this.bean = bean
    }
    /*
     * ================================================
     *                    实例化方法
     * ================================================
     */
    static getForInvokeOnlyById(client: LingChairClient, id: string) {
        return new Chat(client, {
            id
        } as ChatBean)
    }
    static async getById(client: LingChairClient, id: string) {
        try {
            return await this.getByIdOrThrow(client, id)
        } catch (_) {
            return null
        }
    }
    static async getByIdOrThrow(client: LingChairClient, id: string) {
        const re = await client.invoke("Chat.getInfo", {
            token: client.access_token,
            target: id,
        })
        if (re.code == 200)
            return new Chat(client, re.data as unknown as ChatBean)
        throw new CallbackError(re)
    }
    /**
     * ================================================
     *              创建对话 (另类实例化方法)
     * ================================================
     */
    static async getOrCreatePrivateChat(client: LingChairClient, user_id: string) {
        try {
            return await this.getOrCreatePrivateChatOrThrow(client, user_id)
        } catch (_) {
            return null
        }
    }
    static async getOrCreatePrivateChatOrThrow(client: LingChairClient, user_id: string) {
        const re = await client.invoke("Chat.getOrCreatePrivateChat", {
            token: client.access_token,
            target: user_id,
        })
        if (re.code != 200) throw new CallbackError(re)
        return new Chat(client, re.data as unknown as ChatBean)
    }
    static async createGroup(client: LingChairClient, title: string, name?: string) {
        try {
            return await this.createGroupOrThrow(client, title, name)
        } catch (_) {
            return null
        }
    }
    static async createGroupOrThrow(client: LingChairClient, title: string, name?: string) {
        const re = await client.invoke("Chat.createGroup", {
            token: client.access_token,
            title,
            name,
        })
        if (re.code != 200) throw new CallbackError(re)
        return new Chat(client, re.data as unknown as ChatBean)
    }
    /**
     * ================================================
     *                    对话消息
     * ================================================
     */
    async getMessages(args: { page?: number, offset?: number }) {
        return (await this.getMessageBeans(args)).map((v) => new Message(this.client, v))
    }
    async getMessagesOrThrow(args: { page?: number, offset?: number }) {
        return (await this.getMessageBeansOrThrow(args)).map((v) => new Message(this.client, v))
    }
    async getMessageBeans(args: { page?: number, offset?: number }) {
        try {
            return await this.getMessageBeansOrThrow(args)
        } catch (_) {
            return []
        }
    }
    async getMessageBeansOrThrow({ page, offset }: { page?: number, offset?: number }) {
        const re = await this.client.invoke("Chat.getMessageHistory", {
            token: this.client.access_token,
            page,
            offset,
            target: this.bean.id,
        })
        if (re.code == 200) return re.data!.messages as MessageBean[]
        throw new CallbackError(re)
    }
    async sendMessage(text: string) {
        try {
            return await this.sendMessageOrThrow(text)
        } catch (_) {
            return null
        }
    }
    async sendMessageOrThrow(text: string) {
        const re = await this.client.invoke("Chat.sendMessage", {
            token: this.client.access_token,
            text,
            target: this.bean.id,
        })
        if (re.code == 200)
            return new Message(this.client, re.data!.message as MessageBean)
        throw new CallbackError(re)
    }
    /**
     * ================================================
     *                  加入对话申请
     * ================================================
     */
    async getJoinRequests() {
        try {
            return await this.getJoinRequestsOrThrow()
        } catch (_) {
            return []
        }
    }
    async getJoinRequestsOrThrow() {
        const join_requests = await this.getJoinRequestBeansOrThrow()
        return join_requests.map((jr) => new JoinRequest(this.client, jr, this.bean.id))
    }
    async getJoinRequestBeans() {
        try {
            return await this.getJoinRequestBeansOrThrow()
        } catch (_) {
            return []
        }
    }
    async getJoinRequestBeansOrThrow() {
        const re = await this.client.invoke("Chat.getJoinRequests", {
            token: this.client.access_token
        })
        if (re.code == 200)
            return re.data!.join_requests as JoinRequestBean[]
        throw new CallbackError(re)
    }
    /**
     * ================================================
     *                    对话信息
     * ================================================
     */
    async setAvatarFileHash(file_hash: string) {
        try {
            await this.setAvatarFileHashOrThrow(file_hash)
            return true
        } catch (_) {
            return false
        }
    }
    async setAvatarFileHashOrThrow(file_hash: string) {
        const re = await this.client.invoke("Chat.setAvatar", {
            token: this.client.access_token,
            file_hash,
            target: this.bean.id,
        })
        if (re.code != 200) throw new CallbackError(re)
        this.bean.avatar_file_hash = file_hash
    }
    async updateSettings(args: BaseChatSettingsBean) {
        try {
            await this.updateSettingsOrThrow(args)
            return true
        } catch (_) {
            return false
        }
    }
    async updateSettingsOrThrow(args: BaseChatSettingsBean) {
        const re = await this.client.invoke("Chat.updateSettings", {
            token: this.client.access_token,
            target: this.bean.id,
            settings: args
        })
        if (re.code != 200) throw new CallbackError(re)
        this.bean.settings = args
    }
    async getTheOtherUserId() {
        try {
            return await this.getTheOtherUserIdOrThrow()
        } catch (_) {
            return null
        }
    }
    async getTheOtherUserIdOrThrow() {
        const re = await this.client.invoke("Chat.getAnotherUserIdFromPrivate", {
            token: this.client.access_token,
            target: this.bean.id,
        })
        if (re.code != 200) throw new CallbackError(re)
        return re.data!.user_id as string
    }
    /*
     * ================================================
     *                    基本 Bean
     * ================================================
     */
    getId() {
        return this.bean.id
    }
    getTitle() {
        return this.bean.title
    }
    getType() {
        return this.bean.type
    }
    isMember() {
        return this.bean.is_member
    }
    isAdmin() {
        return this.bean.is_admin
    }
    getAvatarFileHash() {
        return this.bean.avatar_file_hash
    }
    getSettings() {
        return this.bean.settings
    }
}
