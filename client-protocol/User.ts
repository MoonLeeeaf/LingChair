import BaseClientObject from "./BaseClientObject.ts"
import UserBean from "./bean/UserBean.ts"
import CallbackError from "./CallbackError.ts"
import LingChairClient from "./LingChairClient.ts"

export default class User extends BaseClientObject {
    declare bean: UserBean
    constructor(client: LingChairClient, bean: UserBean) {
        super(client)
        this.bean = bean
    }
    /*
     * ================================================
     *                    实例化方法
     * ================================================
     */
    static async getById(client: LingChairClient, id: string) {
        try {
            return await this.getByIdOrThrow(client, id)
        } catch(_) {
            return null
        }
    }
    static async getByIdOrThrow(client: LingChairClient, id: string) {
        const re = await client.invoke("User.getInfo", {
            token: client.access_token,
            target: id,
        })
        if (re.code == 200)
            return new User(client, re.data as unknown as UserBean)
        throw new CallbackError(re)
    }
    /*
     * ================================================
     *                    基本 Bean
     * ================================================
     */
    getId() {
        return this.bean.id
    }
    getUserName() {
        return this.bean.username
    }
    getNickName() {
        return this.bean.nickname
    }
    getAvatarFileHash() {
        return this.bean.avatar_file_hash
    }
}
