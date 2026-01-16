import chalk from "chalk"
import Chat from "./Chat.ts"
import User from "./User.ts"

export default class ChatPrivate extends Chat {
    /**
     * 确保是私聊类型后, 转换成私聊对话
     * 实际上没啥用, 因为实例方法都在 Chat
     * 未来可能会移除
     * @param chat
     */
    static fromChat(chat: Chat) {
        return new ChatPrivate(chat.bean)
    }

    static getChatIdByUsersId(userIdA: string, userIdB: string) {
        return 'priv_' + [userIdA, userIdB].sort().join('__').replaceAll('-', '_')
    }

    /**
     * 为两个用户创建对话 (无需注意顺序)
     * @param userA 
     * @param userB 
     */
    static createForPrivate(userA: User, userB: User) {
        const chat = this.create(undefined, 'private')
        chat.setAttr('id', this.getChatIdByUsersId(userA.bean.id, userB.bean.id))
        chat.addMembers([
            userA.bean.id,
            userB.bean.id
        ])
    }
    /**
     * 寻找两个用户间的对话 (无需注意顺序)
     * @param userA 
     * @param userB 
     */
    static findByUsersForPrivate(userA: User, userB: User) {
        const chat = this.findById(this.getChatIdByUsersId(userA.bean.id, userB.bean.id))
        if (chat)
            return this.fromChat(chat as Chat)
    }
    /**
     * 寻找两个用户间的对话, 若无则创建 (无需注意顺序)
     * @param userA 
     * @param userB 
     */
    static findOrCreateForPrivate(userA: User, userB: User) {
        let a = this.findByUsersForPrivate(userA, userB)
        if (a == null) {
            this.createForPrivate(userA, userB)
            a = this.findByUsersForPrivate(userA, userB) as ChatPrivate
        }
        return a
    }
}