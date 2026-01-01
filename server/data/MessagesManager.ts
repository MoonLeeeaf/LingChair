import { DatabaseSync, SQLInputValue } from "node:sqlite"
import { Buffer } from "node:buffer"
import path from 'node:path'
import chalk from "chalk"

import config from "../config.ts"
import Chat from "./Chat.ts"
import MessageBean from "./MessageBean.ts"
import { PageFetchMaxLimit } from "lingchair-internal-shared"

export default class MessagesManager {
    static database: DatabaseSync = this.init()

    private static init(): DatabaseSync {
        const db: DatabaseSync = new DatabaseSync(path.join(config.data_path, 'Messages.db'))
        return db
    }

    static getInstanceForChat(chat: Chat) {
        return new MessagesManager(chat)
    }

    declare chat: Chat
    constructor(chat: Chat) {
        this.chat = chat

        MessagesManager.database.exec(`
            CREATE TABLE IF NOT EXISTS ${this.getTableName()} (
                /* 序号, MessageId */ id INTEGER PRIMARY KEY AUTOINCREMENT,
                /* 消息文本 */ text TEXT NOT NULL,
                /* 发送者 */ user_id TEXT,
                /* 发送时间 */ time INT8 NOT NULL
            );
       `)
    }
    protected getTableName() {
        return `messages_${this.chat.bean.id}`.replaceAll('-', '_')
    }
    addMessage({
        text,
        user_id,
        time
    }: {
        text: string,
        user_id?: string,
        time?: number
    }) {
        return MessagesManager.database.prepare(`INSERT INTO ${this.getTableName()} (
            text,
            user_id,
            time
        ) VALUES (?, ?, ?);`).run(
            text,
            user_id || null,
            time || Date.now()
        ).lastInsertRowid
    }
    addSystemMessage(text: string) {
        this.addMessage({
            text
        })
    }
    getMessagesWithOffset(limit: number | undefined | null, offset: number = 0) {
        const ls = MessagesManager.database.prepare(`SELECT * FROM ${this.getTableName()} ORDER BY id DESC LIMIT ? OFFSET ?;`).all(limit || PageFetchMaxLimit, offset) as unknown as MessageBean[]
        return ls.map((v) => ({
            ...v,
            chat_id: this.chat.bean.id,
        }))
    }
    getMessagesWithPage(limit: number | undefined | null, page: number = 0) {
        return this.getMessagesWithOffset(limit, (limit || PageFetchMaxLimit) * page)
    }
}
