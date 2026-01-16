import chalk from "chalk"
import Chat from "./Chat.ts"
import User from "./User.ts"
import GroupSettingsBean from "./GroupSettingsBean.ts"

class GroupSettings {
    declare chat: ChatGroup
    declare settings: GroupSettingsBean
    constructor(chat: ChatGroup) {
        this.chat = chat
        this.settings = JSON.parse(chat.bean.settings)
    }

    /**
     * 覆盖群组设定
     * @param bean 要覆盖的设定, 不需要覆盖的不需要填入
     */
    update(bean: GroupSettingsBean) {
        const updateValue = (key: string) => {
            if (key in bean)
                this.settings[key] = bean[key]
        }
        for (const k of [
            'allow_new_member_join',
            'allow_new_member_from_invitation',
            'new_member_join_method',
            'answered_and_allowed_by_admin_question',
        ])
            updateValue(k)

        this.apply()
    }
    /**
     * 应用更改
     */
    apply() {
        this.chat.setAttr('settings', JSON.stringify(this.settings))
    }
}

export default class ChatGroup extends Chat {
    getSettings() {
        return new GroupSettings(this)
    }

    /**
     * 确保是群组类型后, 转换成群组对话
     * 唯一的作用可能是修改群组设定
     * @param chat
     */
    static fromChat(chat: Chat) {
        return new ChatGroup(chat.bean)
    }

    /**
     * 创建新的群组
     * @param group_name 群组名称
     */
    static createGroup(group_name?: string) {
        return this.create(group_name, 'group')
    }
}