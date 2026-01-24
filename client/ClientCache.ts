import { Chat, User, UserMySelf } from "lingchair-client-protocol"
import getClient from "./getClient.ts"

type CouldCached = User | Chat | null
export default class ClientCache {
    static caches: { [key: string]: CouldCached } = {}

    static async getMySelf() {
        const k = 'usermyself'
        if (this.caches[k] != null)
            return this.caches[k] as UserMySelf | null
        this.caches[k] = await UserMySelf.getMySelf(getClient())
        return this.caches[k] as UserMySelf | null
    }
    
    static async getUser(id: string) {
        const k = 'user_' + id
        if (this.caches[k] != null)
            return this.caches[k] as User | null
        this.caches[k] = await User.getById(getClient(), id)
        return this.caches[k]
    }

    static async getChat(id: string) {
        const k = 'chat_' + id
        if (this.caches[k] != null)
            return this.caches[k] as Chat | null
        this.caches[k] = await Chat.getById(getClient(), id)
        return this.caches[k]
    }
}
