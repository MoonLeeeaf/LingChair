import { DatabaseSync } from "node:sqlite"
// import { Buffer } from "node:buffer"
import path from 'node:path'

import config from '../config.ts'
import ChatBean from './ChatBean.ts'
import { SQLInputValue } from "node:sqlite"
import chalk from "chalk"
import User from "./User.ts"
import ChatType from "./ChatType.ts"
import UserChatLinker from "./UserChatLinker.ts"
import DataWrongError from '../api/DataWrongError.ts'
import { Buffer } from "node:buffer"
import FileManager from "./FileManager.ts"

/**
 * Chat.ts - Wrapper and manager
 * Wrap with ChatBean to directly update database
 * Manage the database by itself (static)
 */
export default class Chat {
    private static database: DatabaseSync = Chat.init()
    private static init(): DatabaseSync {
        const db: DatabaseSync = new DatabaseSync(path.join(config.data_path, 'Chats.db'))
        db.exec(`
            CREATE TABLE IF NOT EXISTS Chat (
                /* 序号 */ count INTEGER PRIMARY KEY AUTOINCREMENT,
                /* 类型 */ type TEXT NOT NULL,
                /*  ID  */ id TEXT NOT NULL,
                /* 检索 */ name TEXT,
                /* 标题 */ title TEXT,
                /* 头像 */ avatar_file_hash TEXT,
                /* 设置 */ settings TEXT NOT NULL
            );
       `)
        db.exec(`CREATE INDEX IF NOT EXISTS idx_id ON Chat(id);`)
        return db
    }

    protected static findAllChatBeansByCondition(condition: string, ...args: SQLInputValue[]): ChatBean[] {
        return this.database.prepare(`SELECT * FROM Chat WHERE ${condition}`).all(...args) as unknown as ChatBean[]
    }

    static findById(id: string) {
        const beans = this.findAllChatBeansByCondition('id = ?', id)
        if (beans.length == 0)
            return null
        else if (beans.length > 1)
            console.error(chalk.red(`警告: 查询 id = ${id} 时, 查询到多个相同 ID 的 Chat`))
        return new Chat(beans[0])
    }

    static findByName(name: string) {
        const beans = this.findAllChatBeansByCondition('name = ?', name)
        if (beans.length == 0)
            return null
        else if (beans.length > 1)
            console.error(chalk.red(`警告: 查询 name = ${name} 时, 查询到多个相同 name 的 Chat`))
        return new Chat(beans[0])
    }

    /**
     * 对话创建基本方法
     * @param chatName 对话别名, 供查询
     * @param type 对话类型
     */
    static create(chatName: string | undefined, type: ChatType) {
        if (this.findAllChatBeansByCondition('name = ?', chatName || null).length > 0)
            throw new DataWrongError(`对话名称 ${chatName} 已被使用`)
        const chat = new Chat(
            Chat.findAllChatBeansByCondition(
                'count = ?',
                Chat.database.prepare(`INSERT INTO Chat (
                    type,
                    id,
                    name,
                    title,
                    avatar_file_hash,
                    settings
                ) VALUES (?, ?, ?, ?, ?, ?);`).run(
                    type,
                    crypto.randomUUID(),
                    chatName || null,
                    null,
                    null,
                    "{}"
                ).lastInsertRowid
            )[0]
        )
        return chat
    }

    declare bean: ChatBean
    constructor(bean: ChatBean) {
        this.bean = bean

        Chat.database.exec(`
            CREATE TABLE IF NOT EXISTS ${this.getAdminsTableName()} (
                /* 序号 */ count INTEGER PRIMARY KEY AUTOINCREMENT,
                /* 用戶 ID */ user_id TEXT NOT NULL,
                /* 管理权限 */ permissions TEXT NOT NULL
            );
       `)
        Chat.database.exec(`CREATE INDEX IF NOT EXISTS idx_user_id ON ${this.getAdminsTableName()}(user_id);`)
        Chat.database.exec(`
            CREATE TABLE IF NOT EXISTS ${this.getJoinRequestsTableName()} (
                /* 序号 */ count INTEGER PRIMARY KEY AUTOINCREMENT,
                /* 用戶 ID */ user_id TEXT NOT NULL,
                /* 请求原因 */ reason TEXT
            );
       `)
        Chat.database.exec(`CREATE INDEX IF NOT EXISTS idx_user_id ON ${this.getJoinRequestsTableName()}(user_id);`)
    }
    protected getAdminsTableName() {
        return 'admins_' + this.bean.id.replaceAll('-', '_')
    }
    protected getJoinRequestsTableName() {
        return 'join_requests_' + this.bean.id.replaceAll('-', '_')
    }
    setAttr(key: string, value: SQLInputValue) {
        Chat.database.prepare(`UPDATE Chat SET ${key} = ? WHERE count = ?`).run(value, this.bean.count)
        this.bean[key] = value
    }

    /**
     * ======================================================
     *                     加入对话请求
     * ======================================================
     */

    /**
     * 添加加入请求
     * @param userId 
     * @param reason 
     */
    addJoinRequest(userId: string, reason?: string) {
        if (this.findAllJoinRequestsByCondition('user_id = ?', userId).length == 0)
            Chat.database.prepare(`INSERT INTO ${this.getJoinRequestsTableName()} (
                user_id,
                reason
            ) VALUES (?, ?);`).run(
                userId,
                reason || null
            )
    }
    removeJoinRequests(userIds: string[]) {
        userIds.forEach((userId) => Chat.database.prepare(`DELETE FROM ${this.getJoinRequestsTableName()} WHERE user_id = ?`).run(userId))
    }
    getJoinRequests() {
        return Chat.database.prepare(`SELECT * FROM ${this.getJoinRequestsTableName()}`).all()
    }
    protected findAllJoinRequestsByCondition(condition: string, ...args: SQLInputValue[]) {
        return Chat.database.prepare(`SELECT * FROM ${this.getJoinRequestsTableName()} WHERE ${condition}`).all(...args)
    }

    /**
     * ======================================================
     *                       对话管理员
     * ======================================================
     */

    /**
     * 添加对话管理员
     * @param userId 
     * @param permission 
     */
    addAdmin(userId: string, permission: string[] | string) {
        if (!this.checkUserIsAdmin(userId))
            Chat.database.prepare(`INSERT INTO ${this.getAdminsTableName()} (
                user_id,
                permissions
            ) VALUES (?, ?);`).run(
                userId,
                '[]'
            )
        this.setAdminPermissions(userId, permission)
    }
    checkUserIsAdmin(userId: string) {
        return this.findAllAdminsByCondition('user_id = ?', userId).length != 0
    }
    getAdmins() {
        return Chat.database.prepare(`SELECT * FROM ${this.getAdminsTableName()}`).all().map((v) => v.user_id) as string[]
    }
    protected findAllAdminsByCondition(condition: string, ...args: SQLInputValue[]) {
        return Chat.database.prepare(`SELECT * FROM ${this.getAdminsTableName()} WHERE ${condition}`).all(...args)
    }
    setAdminPermissions(userId: string, permission: string[] | string) {
        Chat.database.prepare(`UPDATE ${this.getAdminsTableName()} SET permissions = ? WHERE user_id = ?`).run(
            userId,
            permission instanceof Array ? JSON.stringify(permission) : permission
        )
    }
    removeAdmins(userIds: string[]) {
        userIds.forEach((v) => Chat.database.prepare(`DELETE FROM ${this.getAdminsTableName()} WHERE user_id = ?`).run(v))
    }

    /**
     * ======================================================
     *                       对话成员
     * ======================================================
     */

    /**
     * 获取对话成员
     */
    getMembersList() {
        return UserChatLinker.getChatMembers(this.bean.id)
    }
    addMembers(userIds: string[]) {
        userIds.forEach((v) => UserChatLinker.linkUserAndChat(v, this.bean.id))
    }
    removeMembers(userIds: string[]) {
        userIds.forEach((v) => UserChatLinker.unlinkUserAndChat(v, this.bean.id))
    }

    /**
     * ======================================================
     *                       对话信息
     * ======================================================
     */

    /**
     * 从**私聊**中获取对方用户
     * @param userMySelf 
     */
    getAnotherUserForPrivate(userMySelf: User) {
        const members = this.getMembersList()
        const user_a_id = members[0]
        const user_b_id = members[1]
        if (members.length == 1 && user_a_id == userMySelf.bean.id)
            return userMySelf
        // 注意: 這裏已經確定了 Chat, 不需要再指定對方用戶
        if (user_a_id == userMySelf.bean.id)
            return User.findById(user_b_id as string)
        if (user_b_id == userMySelf.bean.id)
            return User.findById(user_a_id as string)

        return null
    }
    setName(name: string) {
        if (this.bean.name == name) return
        if (name != null && Chat.findAllChatBeansByCondition('name = ?', name).length > 0)
            throw new DataWrongError(`对话名称 ${name} 已被使用`)
        this.setAttr("name", name)
    }
    setTitle(title: string) {
        if (this.bean.type == 'private')
            throw new Error('不允许对私聊进行命名')
        this.setAttr('title', title)
    }
    getTitle(userMySelf?: User) {
        if (this.bean.type == 'group') return this.bean.title
        if (this.bean.type == 'private') return this.getAnotherUserForPrivate(userMySelf as User)?.getNickName()
    }
    getAvatarFileHash(userMySelf?: User) {
        if (this.bean.type == 'group') return this.bean.avatar_file_hash
        if (this.bean.type == 'private') return this.getAnotherUserForPrivate(userMySelf as User)?.getAvatarFileHash()
    }
    setAvatarFileHash(hash: string) {
        this.setAttr("avatar_file_hash", hash)
    }
    async setAvatar(avatar: Buffer) {
        this.setAvatarFileHash((await FileManager.uploadFile(`avatar_chat_${this.bean.count}`, avatar)).getHash())
    }
}
