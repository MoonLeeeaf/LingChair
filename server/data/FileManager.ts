import { DatabaseSync, SQLInputValue } from "node:sqlite"
import { Buffer } from "node:buffer"
import path from 'node:path'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import fs_sync from 'node:fs'
import chalk from "chalk"
import { fileTypeFromBuffer } from 'file-type'

import config from "../config.ts"

class FileBean {
    declare count: number
    declare name: string
    declare hash: string
    declare mime: string
    declare chatid?: string
    declare upload_time: number
    declare last_used_time: number
}

type FileBeanKey = keyof FileBean

class File {
    declare bean: FileBean
    constructor(bean: FileBean) {
        this.bean = bean
    }
    private setAttr(key: FileBeanKey, value: SQLInputValue) {
        FileManager.database.prepare(`UPDATE ${FileManager.table_name} SET ${key} = ? WHERE count = ?`).run(value, this.bean.count)
        this.bean[key] = value as never
    }
    getMime() {
        return this.bean.mime
    }
    getName() {
        return this.bean.name
    }
    /**
     * 获取文件的相对路径
     */
    getFilePath() {
        const hash = this.bean.hash
        return path.join(
            config.data_path,
            "uploaded_files",
            hash.substring(0, 1),
            hash.substring(2, 3),
            hash.substring(3, 4),
            this.bean.hash
        )
    }
    getChatId() {
        return this.bean.chatid
    }
    getUploadTime() {
        return this.bean.upload_time
    }
    updateLastUsedTime() {
       this.setAttr("last_used_time", Date.now())
    }
    getLastUsedTime() {
        return this.bean.last_used_time
    }
    getHash() {
        return this.bean.hash
    }
    readSync() {
        this.setAttr("last_used_time", Date.now())
        return fs_sync.readFileSync(this.getFilePath())
    }
}

export default class FileManager {
    static FileBean = FileBean
    static File = File

    static table_name: string = "FileReferences"
    static database: DatabaseSync = FileManager.init()
    private static init(): DatabaseSync {
        const db: DatabaseSync = new DatabaseSync(path.join(config.data_path, FileManager.table_name + '.db'))
        db.exec(`
            CREATE TABLE IF NOT EXISTS ${FileManager.table_name} (
                /* 序号 */ count INTEGER PRIMARY KEY AUTOINCREMENT,
                /* 文件名称 */ name TEXT NOT NULL,
                /* 文件哈希 */ hash TEXT NOT NULL,
                /* MIME 类型 */ mime TEXT NOT NULL,
                /* 来源对话 */ chatid TEXT,
                /* 上传时间 */ upload_time INT8 NOT NULL,
                /* 最后使用时间 */ last_used_time INT8 NOT NULL
            );
       `)
        return db
    }

    /**
     * 上传文件 (与 HTTP API 对接)
     * @param fileName 文件名
     * @param data 文件二进制数据
     * @param chatId 所属的对话
     */
    static async uploadFile(fileName: string, data: Buffer, chatId?: string) {
        const hash = crypto.createHash('sha256').update(data).digest('hex')
        const file = FileManager.findByHash(hash)
        if (file) return file

        const mime = (await fileTypeFromBuffer(data))?.mime || 'application/octet-stream'
        const folder = path.join(
            config.data_path,
            "uploaded_files",
            hash.substring(0, 1),
            hash.substring(2, 3),
            hash.substring(3, 4)
        )
        await fs.mkdir(folder, { recursive: true })
        await fs.writeFile(
            path.join(
                folder,
                hash
            ),
            data
        )
        return new FileManager.File(
            FileManager.findAllBeansByCondition(
                'count = ?',
                FileManager.database.prepare(`INSERT INTO ${FileManager.table_name} (
                    name,
                    hash,
                    mime,
                    chatid,
                    upload_time,
                    last_used_time
                ) VALUES (?, ?, ?, ?, ?, ?);`).run(
                    fileName,
                    hash,
                    mime,
                    chatId || null,
                    Date.now(),
                    -1
                ).lastInsertRowid
            )[0]
        )
    }

    private static findAllBeansByCondition(condition: string, ...args: SQLInputValue[]): FileBean[] {
        return FileManager.database.prepare(`SELECT * FROM ${FileManager.table_name} WHERE ${condition};`).all(...args) as unknown as FileBean[]
    }
    static findByHash(hash: string): File | null {
        const beans = FileManager.findAllBeansByCondition('hash = ?', hash)
        if (beans.length == 0)
            return null
        else if (beans.length > 1)
            console.error(chalk.red(`警告: 查询 hash = ${hash} 时, 查询到多个相同 Hash 的文件`))
        return new FileManager.File(beans[0])
    }
}
