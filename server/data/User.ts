import { DatabaseSync } from "node:sqlite"
import { Buffer } from "node:buffer"
import path from 'node:path'
import crypto from 'node:crypto'

import chalk from 'chalk'

import config from '../config.ts'
import UserBean from './UserBean.ts'

import FileManager from './FileManager.ts'
import { SQLInputValue } from "node:sqlite"
import ChatPrivate from "./ChatPrivate.ts"
import DataWrongError from '../api/DataWrongError.ts'
import UserChatLinker from "./UserChatLinker.ts"
import UserFavouriteChatLinker from "./UserFavouriteChatLinker.ts"
import UserRecentChatLinker from "./UserRecentChatLinker.ts"

type UserBeanKey = keyof UserBean

/**
 * User.ts - Wrapper and manager
 * Wrap with UserBean to directly update database
 * Manage the database by itself (static)
 */
export default class User {
    static table_name: string = "Users"
    private static database: DatabaseSync = User.init()
    private static init() {
        const db: DatabaseSync = new DatabaseSync(path.join(config.data_path, 'Users.db'))
        db.exec(`
            CREATE TABLE IF NOT EXISTS ${User.table_name} (
                /* 序号 */ count INTEGER PRIMARY KEY AUTOINCREMENT,
                /* 用户 ID, UUID */ id TEXT,
                /* 密码摘要 */ password TEXT,
                /* 注册时间 */ registered_time INT8 NOT NULL,
                /* 用户名 */ username TEXT,
                /* 昵称 */ nickname TEXT NOT NULL,
                /* 头像, 可选 */ avatar_file_hash TEXT,
                /* 设置 */ settings TEXT NOT NULL
            );
       `)
        db.exec(`CREATE INDEX IF NOT EXISTS idx_id ON ${User.table_name}(id);`)
        db.exec(`CREATE INDEX IF NOT EXISTS idx_username ON ${User.table_name}(username);`)
        db.exec(`CREATE INDEX IF NOT EXISTS idx_nickname ON ${User.table_name}(nickname);`)
        return db
    }

    /**
     * 检查用户名是否存在, 不存在则创建用户, 否则报错
     * @param userName 
     * @param password 
     * @param nickName 
     * @param avatar 
     */
    static create(userName: string | null, password: string, nickName: string, avatar: Buffer | null) {
        if (userName && User.findAllBeansByCondition('username = ?', userName).length > 0)
            throw new DataWrongError(`用户名 ${userName} 已存在`)
        const user = new User(
            User.findAllBeansByCondition(
                'count = ?',
                User.database.prepare(`INSERT INTO ${User.table_name} (
                    id,
                    password,
                    registered_time,
                    username,
                    nickname,
                    avatar_file_hash,
                    settings
                ) VALUES (?, ?, ?, ?, ?, ?, ?);`).run(
                    crypto.randomUUID(),
                    password,
                    Date.now(),
                    userName,
                    nickName,
                    null,
                    "{}"
                ).lastInsertRowid
            )[0]
        )
        avatar && user.setAvatar(avatar)
        ChatPrivate.findOrCreateForPrivate(user, user)
        return user
    }

    private static findAllBeansByCondition(condition: string, ...args: SQLInputValue[]): UserBean[] {
        return User.database.prepare(`SELECT * FROM ${User.table_name} WHERE ${condition};`).all(...args) as unknown as UserBean[]
    }
    static findById(id: string) {
        const beans = User.findAllBeansByCondition('id = ?', id)
        if (beans.length == 0)
            return null
        else if (beans.length > 1)
            console.error(chalk.red(`警告: 查询 id = ${id} 时, 查询到多个相同用户 ID 的用户`))
        return new User(beans[0])
    }
    static findByUserName(userName: string) {
        const beans = User.findAllBeansByCondition('username = ?', userName)
        if (beans.length == 0)
            return null
        else if (beans.length > 1)
            console.error(chalk.red(`警告: 查询 username = ${userName} 时, 查询到多个相同用户名的用户`))
        return new User(beans[0])
    }
    /**
     * 通过用户名或 ID 获取某个用户, 用户名优先
     * @param account 用户名或用户 ID 
     */
    static findByAccount(account: string) {
        return User.findByUserName(account) || User.findById(account)
    }

    declare bean: UserBean
    constructor(bean: UserBean) {
        this.bean = bean
    }
    /* 一切的基础都是 count ID */
    private setAttr(key: string, value: SQLInputValue) {
        User.database.prepare(`UPDATE ${User.table_name} SET ${key} = ? WHERE count = ?`).run(value, this.bean.count)
        this.bean[key] = value
    }
    getUserName() {
        return this.bean.username
    }
    setUserName(userName: string) {
        if (this.getUserName() == userName) return
        if (User.findAllBeansByCondition('username = ?', userName).length > 0)
            throw new DataWrongError(`用户名 ${userName} 已存在`)
        this.setAttr("username", userName)
    }
    updateRecentChat(chatId: string, content: string) {
        UserRecentChatLinker.updateOrAddRecentChat(this.bean.id, chatId, content)
    }
    getRecentChats() {
        return UserRecentChatLinker.getUserRecentChatBeans(this.bean.id)
    }

    getFavouriteChats() {
        return UserFavouriteChatLinker.getUserFavouriteChats(this.bean.id)
    }
    addFavouriteChats(chatIds: string[]) {
        chatIds.forEach((v) => UserFavouriteChatLinker.linkUserAndChat(this.bean.id, v))
    }
    removeFavouriteChats(chatIds: string[]) {
        chatIds.forEach((v) => UserFavouriteChatLinker.unlinkUserAndChat(this.bean.id, v))
    }
    addFavouriteChat(chatId: string) {
        this.addFavouriteChats([chatId])
    }

    getAllChatsList() {
        return UserChatLinker.getUserChats(this.bean.id)
    }
    getNickName() {
        return this.bean.nickname
    }
    setNickName(nickName: string) {
        this.setAttr("nickname", nickName)
    }
    getPassword() {
        return this.bean.password
    }
    setPassword(password: string) {
        this.setAttr("password", password)
    }
    getAvatarFileHash() {
        return this.bean.avatar_file_hash
    }
    setAvatarFileHash(hash: string) {
        this.setAttr("avatar_file_hash", hash)
    }
    async setAvatar(avatar: Buffer) {
        this.setAvatarFileHash((await FileManager.uploadFile(`avatar_user_${this.bean.count}`, avatar)).getHash())
    }
}
