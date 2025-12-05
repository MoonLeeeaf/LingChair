import RecentChatBean from "./bean/RecentChatBean.ts"
import Chat from "./Chat.ts"
import LingChairClient from "./LingChairClient.ts"

export default class RecentChat extends Chat {
    declare bean: RecentChatBean
    constructor(client: LingChairClient, bean: RecentChatBean) {
        super(client, bean)
    }
    getContent() {
        return this.bean.content
    }
}
