export default class RecentChatBean {
    declare count: number
    /** 最近对话所关联的用户 */
    declare user_id: string
    declare chat_id: string
    declare content: string
    declare updated_time: number

    [key: string]: unknown
}
