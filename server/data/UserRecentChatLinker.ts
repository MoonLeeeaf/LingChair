import { DatabaseSync } from "node:sqlite"
import path from 'node:path'

import RecentChatBean from './RecentChatBean.ts'
import config from "../config.ts"
import { SQLInputValue } from "node:sqlite"

export default class UserRecentChatLinker {
    static database: DatabaseSync = this.init()

    private static init(): DatabaseSync {
        const db: DatabaseSync = new DatabaseSync(path.join(config.data_path, 'UserRecentChatLinker.db'))
        db.exec(`
            CREATE TABLE IF NOT EXISTS UserRecentChatLinker (
                /* 序号 */ count INTEGER PRIMARY KEY AUTOINCREMENT,
                /* 用戶 ID */ user_id TEXT NOT NULL,
                /* Chat ID */ chat_id TEXT NOT NULL,
                /* Last Message Content */ content TEXT NOT NULL,
                /* Last Update Time */ updated_time INT8 NOT NULL
            );
       `)
        db.exec(`CREATE INDEX IF NOT EXISTS idx_user_id ON UserRecentChatLinker(user_id);`)
        return db
    }

    /**
     * 若用户和对话未关联, 则进行关联
     */
    static updateOrAddRecentChat(userId: string, chatId: string, content: string) {
        if (!this.checkUserIsLinkedToChat(userId, chatId))
            this.database.prepare(`INSERT INTO UserRecentChatLinker (
                user_id,
                chat_id,
                content,
                updated_time
            ) VALUES (?, ?, ?, ?);`).run(
                userId,
                chatId,
                content,
                Date.now()
            )
        else
            this.database.prepare('UPDATE UserRecentChatLinker SET content = ?, updated_time = ? WHERE count = ?').run(
                content,
                Date.now(),
                /* 既然已经 bind 了, 那么就不需要判断了? */
                this.findAllByCondition('user_id = ? AND chat_id = ?', userId, chatId)[0].count
            )
    }
    /**
     * 解除用户和对话的关联
     */
    static removeRecentChat(userId: string, chatId: string) {
        this.database.prepare(`DELETE FROM UserRecentChatLinker WHERE user_id = ? AND chat_id = ?`).run(userId, chatId)
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
    static getUserRecentChatBeans(userId: string) {
        return this.findAllByCondition('user_id = ? ORDER BY updated_time DESC', userId) as unknown as RecentChatBean[]
    }
    protected static findAllByCondition(condition: string, ...args: SQLInputValue[]) {
        return this.database.prepare(`SELECT * FROM UserRecentChatLinker WHERE ${condition}`).all(...args)
    }
}
