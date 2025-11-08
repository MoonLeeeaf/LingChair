import BaseClientObject from "./BaseClientObject.ts"
import JoinRequestBean from "./bean/JoinRequestBean.ts"
import CallbackError from "./CallbackError.ts"
import LingChairClient from "./LingChairClient.ts"
import JoinRequestAction from "./type/JoinRequestAction.ts"

export default class JoinRequest extends BaseClientObject {
    declare bean: JoinRequestBean
    declare chat_id: string
    constructor(client: LingChairClient, bean: JoinRequestBean, chat_id: string) {
        super(client)
        this.bean = bean
        this.chat_id = chat_id
    }
    /*
     * ================================================
     *                      操作
     * ================================================
     */
    async accept() {
        return await this.process('accept')
    }
    async acceptOrThrow() {
        return await this.processOrThrow('accept')
    }
    async remove() {
        return await this.process('remove')
    }
    async removOrThrow() {
        return await this.processOrThrow('remove')
    }
    async process(action: JoinRequestAction) {
        try {
            await this.processOrThrow(action)
            return true
        } catch (_) {
            return false
        }
    }
    async processOrThrow(action: JoinRequestAction) {
        const re = await this.client.invoke("Chat.processJoinRequest", {
            token: this.client.access_token,
            chat_id: this.chat_id,
            user_id: this.bean.user_id,
            action,
        })
        if (re.code != 200) throw new CallbackError(re)
    }
    /*
     * ================================================
     *                    基本 Bean
     * ================================================
     */
    getAvatarFileHash() {
        return this.bean.avatar_file_hash
    }
    getUserId() {
        return this.bean.user_id
    }
    getNickName() {
        return this.bean.title
    }
    getReason() {
        return this.bean.reason
    }
}
