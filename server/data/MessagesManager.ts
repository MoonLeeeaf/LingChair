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

    /**
     * 为对话获取实例
     * @param chat 对话
     */
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
    /**
     * 添加一条消息
     */
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
    /**
     * 添加一条无用户信息的系统消息
     */
    addSystemMessage(text: string) {
        this.addMessage({
            text
        })
    }
    /**
     * 从最新消息开始偏移某些量向**前**获取 n 条消息 (顺序: 从新到旧)
     * @param limit 获取消息的数量
     * @param offset 偏移量
     */
    getMessagesWithOffset(limit: number | undefined | null, offset: number = 0): MessageBean[] {
        const ls = MessagesManager.database.prepare(`SELECT * FROM ${this.getTableName()} ORDER BY id DESC LIMIT ? OFFSET ?;`).all(limit || PageFetchMaxLimit, offset) as unknown as MessageBean[]
        return ls.map((v) => ({
            ...v,
            chat_id: this.chat.bean.id,
        })).reverse()
    }
    /**
     * 从最新消息开始偏移某些量向**前**获取第 n 页消息 (顺序: 从新到旧)
     * @param limit 获取消息的数量
     * @param page 页数
     */
    getMessagesWithPage(limit: number | undefined | null, page: number = 0) {
        return this.getMessagesWithOffset(limit, (limit || PageFetchMaxLimit) * page)
    }
    /**
     * 获取最新的消息的 ID
     */
    getNewestMessageId() {
        return MessagesManager.database.prepare(`SELECT id FROM ${this.getTableName()} ORDER BY id DESC LIMIT 1;`).all()[0].id as number | undefined
    }
    /**
     * 从某消息开始获取包括其在内往**前**的 n 条消息 (顺序: 从新到旧)
     * @param limit 获取消息的数量
     * @param msg_id 从哪条开始? (-1 = 最新)
     */
    getMessagesEndWith(limit: number | undefined | null, msg_id: number) {
        const newestMessageId = this.getNewestMessageId()
        const offset = (msg_id == -1 || newestMessageId == null) ? 0 : (newestMessageId - msg_id)
        return this.getMessagesWithOffset(limit, offset)
    }
    /**
     * 从某消息开始获取包括其在内往**后**的 n 条消息 (顺序: 从新到旧)
     * @param limit 获取消息的数量
     * @param msg_id 从哪条开始? (-1 = 最新)
     */
    getMessagesBeginWith(limit: number | undefined | null, msg_id: number) {
        const newestMessageId = this.getNewestMessageId()
        const offset = (msg_id == -1 || newestMessageId == null) ? 0 : (newestMessageId - msg_id)
        return this.getMessagesWithOffset(limit, offset)
    }
}
