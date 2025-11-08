import BaseClientObject from "./BaseClientObject.ts"
import MessageBean from "./bean/MessageBean.ts"
import LingChairClient from "./LingChairClient.ts"
import Chat from "./Chat.ts"
import User from "./User.ts"

export default class Message extends BaseClientObject {
    declare bean: MessageBean
    constructor(client: LingChairClient, bean: MessageBean) {
        super(client)
        this.bean = bean
    }
    /*
     * ================================================
     *                    基本 Bean
     * ================================================
     */
    getId() {
        return this.bean.id
    }
    getChatId() {
        return this.bean.chat_id
    }
    async getChat() {
        return await Chat.getById(this.client, this.bean.chat_id as string)
    }
    getText() {
        return this.bean.text
    }
    getUserId() {
        return this.bean.user_id
    }
    async getUser() {
        return await User.getById(this.client, this.bean.user_id as string)
    }
    getTime() {
        return this.bean.time
    }
}