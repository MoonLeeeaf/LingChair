import ChatType from "./ChatType.ts"

export default class ChatBean {
    declare type: ChatType
    declare id: string
    declare title: string
    declare avatar_file_hash?: string
    declare settings?: { [key: string]: unknown }

    declare is_member: boolean
    declare is_admin: boolean

    [key: string]: unknown
}
