import { DatabaseSync } from "node:sqlite"
import path from 'node:path'

import config from "../config.ts"
import User from "../data/User.ts"
import EventBean from "./EventBean.ts"
import { ClientEvent } from "./ApiDeclare.ts"

export default class EventStorer {
    static database: DatabaseSync = this.init()

    private static init(): DatabaseSync {
        const db: DatabaseSync = new DatabaseSync(path.join(config.data_path, 'Events.db'))
        return db
    }

    static getInstanceForUser(user: User | string) {
        return new EventStorer(user)
    }

    declare user_id: string
    constructor(user: User | string) {
        this.user_id = user instanceof User ? user.bean.id : user

        EventStorer.database.exec(`
            CREATE TABLE IF NOT EXISTS ${this.getTableName()} (
                /* 序号 */ count INTEGER PRIMARY KEY AUTOINCREMENT,
                /* 事件 */ event_name TEXT NOT NULL,
                /* 数据 */ data TEXT NOT NULL,
                /* 会话 */ device_session TEXT
            );
       `)
    }
    protected getTableName() {
        return `events_${this.user_id.replaceAll('-', '_')}`
    }
    addEvent(eventName: ClientEvent, data: object, device_session: string) {
        EventStorer.database.prepare(`INSERT INTO ${this.getTableName()} (
            event_name,
            data,
            device_session
        ) VALUES (?, ?, ?);`).run(
            eventName,
            JSON.stringify(data),
            device_session || null
        )
    }
    getEvents(device_session?: string) {
        return EventStorer.database.prepare(`SELECT * FROM ${this.getTableName()}${device_session ? ` WHERE device_session = ?` : ''};`).all(...(device_session ? [ device_session ] : [])).map((v: any) => ({
            ...v,
            data: JSON.parse(v.data)
        })) as unknown as EventBean[]
    }
    clearEvents(device_session?: string) {
        EventStorer.database.prepare(`DELETE FROM ${this.getTableName()}${device_session ? ` WHERE device_session = ?` : ''};`).run(...(device_session ? [ device_session ] : []))
    }
}
