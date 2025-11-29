import { ClientEvent } from "./ApiDeclare.ts"

export default class EventBean {
    declare event_name: ClientEvent
    declare data: { [key: string]: unknown }
    declare device_session: string
}