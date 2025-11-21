import { DatabaseSync } from "node:sqlite"
import path from 'node:path'

import config from "../config.ts"
import { SQLInputValue } from "node:sqlite"
export default class UserChatLinker {
    static database: DatabaseSync = this.init()

    private static init(): DatabaseSync {
        const db: DatabaseSync = new DatabaseSync(path.join(config.data_path, 'UserChatLinker.db'))
        db.exec(`
            CREATE TABLE IF NOT EXISTS UserChatLinker (
                /* 序号 */ count INTEGER PRIMARY KEY AUTOINCREMENT,
                /* 用戶 ID */ user_id TEXT NOT NULL,
                /* Chat ID */ chat_id TEXT NOT NULL
            );
       `)
        db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_id ON UserChatLinker(chat_id);`)
        db.exec(`CREATE INDEX IF NOT EXISTS idx_user_id ON UserChatLinker(user_id);`)
        return db
    }

    /**
     * 對用戶和對話建立關聯
     * 自動檢測是否已關聯, 保證不會重複
     */
    static linkUserAndChat(userId: string, chatId: string) {
        if (!this.checkUserIsLinkedToChat(userId, chatId))
            this.database.prepare(`INSERT INTO UserChatLinker (
                user_id,
                chat_id
            ) VALUES (?, ?);`).run(
                userId,
                chatId
            )
    }
    static unlinkUserAndChat(userId: string, chatId: string) {
        this.database.prepare(`DELETE FROM UserChatLinker WHERE user_id = ? AND chat_id = ?`).run(userId, chatId)
    }
    static checkUserIsLinkedToChat(userId: string, chatId: string) {
        return this.findAllByCondition('user_id = ? AND chat_id = ?', userId, chatId).length != 0
    }
    static getUserChats(userId: string) {
        return this.findAllByCondition('user_id = ?', userId).map((v) => v.chat_id) as string[]
    }
    static getChatMembers(chatId: string) {
        return this.findAllByCondition('chat_id = ?', chatId).map((v) => v.user_id) as string[]
    }
    protected static findAllByCondition(condition: string, ...args: SQLInputValue[]) {
        return this.database.prepare(`SELECT * FROM UserChatLinker WHERE ${condition}`).all(...args)
    }
}
