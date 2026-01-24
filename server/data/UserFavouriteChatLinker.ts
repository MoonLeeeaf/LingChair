import { DatabaseSync } from "node:sqlite"
import path from 'node:path'

import config from "../config.ts"
import { SQLInputValue } from "node:sqlite"

export default class UserFavouriteChatLinker {
    static database: DatabaseSync = this.init()

    private static init(): DatabaseSync {
        const db: DatabaseSync = new DatabaseSync(path.join(config.data_path, 'UserFavouriteChatLinker.db'))
        db.exec(`
            CREATE TABLE IF NOT EXISTS UserFavouriteChatLinker (
                /* 序号 */ count INTEGER PRIMARY KEY AUTOINCREMENT,
                /* 用戶 ID */ user_id TEXT NOT NULL,
                /* Chat ID */ chat_id TEXT NOT NULL
            );
       `)
        db.exec(`CREATE INDEX IF NOT EXISTS idx_user_id ON UserFavouriteChatLinker(user_id);`)
        return db
    }

    /**
     * 若用户和对话未关联, 则进行关联
     */
    static linkUserAndChat(userId: string, chatId: string) {
        if (!this.checkUserIsLinkedToChat(userId, chatId))
            this.database.prepare(`INSERT INTO UserFavouriteChatLinker (
                user_id,
                chat_id
            ) VALUES (?, ?);`).run(
                userId,
                chatId
            )
    }
    /**
     * 解除用户和对话的关联
     */
    static unlinkUserAndChat(userId: string, chatId: string) {
        this.database.prepare(`DELETE FROM UserFavouriteChatLinker WHERE user_id = ? AND chat_id = ?`).run(userId, chatId)
    }
    /**
     * 检测用户和对话的关联
     */
    static checkUserIsLinkedToChat(userId: string, chatId: string) {
        return this.findAllByCondition('user_id = ? AND chat_id = ?', userId, chatId).length != 0
    }
    /**
     * 获取用户所有关联的对话
     */
    static getUserFavouriteChats(userId: string) {
        return this.findAllByCondition('user_id = ?', userId).map((v) => v.chat_id) as string[]
    }
    protected static findAllByCondition(condition: string, ...args: SQLInputValue[]) {
        return this.database.prepare(`SELECT * FROM UserFavouriteChatLinker WHERE ${condition}`).all(...args)
    }
}
