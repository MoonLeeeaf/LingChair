import CallbackError from "./CallbackError.ts"
import Chat from "./Chat.ts"
import LingChairClient from "./LingChairClient.ts"
import RecentChat from "./RecentChat.ts"
import User from "./User.ts"
import ChatBean from "./bean/ChatBean.ts"
import RecentChatBean from "./bean/RecentChatBean.ts"
import UserBean from "./bean/UserBean.ts"

export default class UserMySelf extends User {
    /*
     * ================================================
     *                    实例化方法
     * ================================================
     */
    static async getMySelf(client: LingChairClient) {
        try {
            return await this.getMySelfOrThrow(client)
        } catch (_) {
            return null
        }
    }
    static async getMySelfOrThrow(client: LingChairClient) {
        const re = await client.invoke("User.getMyInfo", {
            token: client.access_token,
        })
        if (re.code == 200)
            return new UserMySelf(client, re.data as unknown as UserBean)
        throw new CallbackError(re)
    }
    /*
     * ================================================
     *                    账号相关
     * ================================================
     */
    async resetPassword(old_password: string, new_password: string) {
        try {
            await this.resetPasswordOrThrow(old_password, new_password)
            return true
        } catch (_) {
            return false
        }
    }
    async resetPasswordOrThrow(old_password: string, new_password: string) {
        const re = await this.client.invoke("User.resetPassword", {
            token: this.client.access_token,
            old_password,
            new_password,
        })
        if (re.code != 200) throw new CallbackError(re)
    }
    /*
     * ================================================
     *                    个人资料
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
        const re = await this.client.invoke("User.setAvatar", {
            token: this.client.access_token,
            file_hash,
        })
        if (re.code != 200) throw new CallbackError(re)
        this.bean.avatar_file_hash = file_hash
    }
    async setUserName(user_name: string) {
        return await this.updateProfile({ username: user_name })
    }
    async setUserNameOrThrow(user_name: string) {
        await this.updateProfileOrThrow({ username: user_name })
    }
    async setNickName(nick_name: string) {
        return await this.updateProfile({ nickname: nick_name })
    }
    async setNickNameOrThrow(nick_name: string) {
        await this.updateProfileOrThrow({ nickname: nick_name })
    }
    async updateProfile(args: {
        username?: string,
        nickname?: string
    }) {
        try {
            await this.updateProfileOrThrow(args)
            return true
        } catch (_) {
            return false
        }
    }
    async updateProfileOrThrow({
        username,
        nickname
    }: {
        username?: string,
        nickname?: string
    }) {
        const re = await this.client.invoke("User.updateProfile", {
            token: this.client.access_token,
            nickname,
            username,
        })
        if (re.code != 200) throw new CallbackError(re)
        nickname && (this.bean.nickname = nickname)
        username && (this.bean.username = username)
    }
    /*
     * ================================================
     *                    收藏对话
     * ================================================
     */
    async addFavouriteChats(chat_ids: string[]) {
        try {
            await this.addFavouriteChatsOrThrow(chat_ids)
            return true
        } catch (_) {
            return false
        }
    }
    async addFavouriteChatsOrThrow(chat_ids: string[]) {
        const re = await this.client.invoke("User.addContacts", {
            token: this.client.access_token,
            targets: chat_ids,
        })
        if (re.code != 200) throw new CallbackError(re)
    }
    async removeFavouriteChats(chat_ids: string[]) {
        try {
            await this.removeFavouriteChatsOrThrow(chat_ids)
            return true
        } catch (_) {
            return false
        }
    }
    async removeFavouriteChatsOrThrow(chat_ids: string[]) {
        const re = await this.client.invoke("User.removeContacts", {
            token: this.client.access_token,
            targets: chat_ids,
        })
        if (re.code != 200) throw new CallbackError(re)
    }
    async getMyFavouriteChatBeans() {
        try {
            return await this.getMyFavouriteChatBeansOrThrow()
        } catch (_) {
            return []
        }
    }
    async getMyFavouriteChatBeansOrThrow() {
        const re = await this.client.invoke("User.getMyContacts", {
            token: this.client.access_token
        })
        if (re.code == 200)
            return (re.data!.favourite_chats || re.data!.contacts_list) as ChatBean[]
        throw new CallbackError(re)
    }
    async getMyFavouriteChats() {
        try {
            return await this.getMyFavouriteChatsOrThrow()
        } catch (_) {
            return []
        }
    }
    async getMyFavouriteChatsOrThrow() {
        return (await this.getMyFavouriteChatBeansOrThrow()).map((bean) => new Chat(this.client, bean))
    }
    /*
     * ================================================
     *                    最近对话
     * ================================================
     */
    async getMyRecentChatBeans() {
        try {
            return await this.getMyRecentChatBeansOrThrow()
        } catch (_) {
            return []
        }
    }
    async getMyRecentChatBeansOrThrow() {
        const re = await this.client.invoke("User.getMyRecentChats", {
            token: this.client.access_token
        })
        if (re.code == 200)
            return re.data!.recent_chats as RecentChatBean[]
        throw new CallbackError(re)
    }
    async getMyRecentChats() {
        try {
            return await this.getMyRecentChatsOrThrow()
        } catch (_) {
            return []
        }
    }
    async getMyRecentChatsOrThrow() {
        return (await this.getMyRecentChatBeansOrThrow()).map((bean) => new RecentChat(this.client, bean))
    }
    /*
     * ================================================
     *                    所有对话
     * ================================================
     */
    async getMyAllChatBeans() {
        try {
            return await this.getMyAllChatBeansOrThrow()
        } catch (_) {
            return []
        }
    }
    async getMyAllChatBeansOrThrow() {
        const re = await this.client.invoke("User.getMyAllChats", {
            token: this.client.access_token
        })
        if (re.code == 200)
            return re.data!.all_chats as ChatBean[]
        throw new CallbackError(re)
    }
    async getMyAllChats() {
        try {
            return await this.getMyAllChatsOrThrow()
        } catch (_) {
            return []
        }
    }
    async getMyAllChatsOrThrow() {
        return (await this.getMyAllChatBeansOrThrow()).map((bean) => new Chat(this.client, bean))
    }
}
