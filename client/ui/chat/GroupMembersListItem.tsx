import { $, dialog } from "mdui"
import Avatar from "../Avatar.tsx"
import React from 'react'
import User from "../../api/client_data/User.ts"
import getUrlForFileByHash from "../../getUrlForFileByHash.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    user: User
}

export default function GroupMembersListItem({ user }: Args) {
    const { id, nickname, avatar_file_hash } = user

    const itemRef = React.useRef<HTMLElement>(null)
    return (
        <mdui-list-item rounded style={{
            marginTop: '3px',
            marginBottom: '3px',
        }} ref={itemRef}>
            {nickname}
            <Avatar src={getUrlForFileByHash(avatar_file_hash)} text={nickname} slot="icon" />
            <div slot="end-icon">
                <mdui-button-icon icon="delete" onClick={() => dialog({
                    headline: "移除群组成员",
                    description: `确定要移除 ${nickname} 吗?`,
                    actions: [
                        {
                            text: "取消",
                            onClick: () => {
                                return true
                            },
                        },
                        {
                            text: "确定",
                            onClick: () => {
                                ;(async () => {
                                    const re = await Client.invoke("Chat.removeMembers", {
                                        token: data.access_token,
                                        chat_id: target,
                                        user_ids: [
                                            id
                                        ],
                                    })
                                    if (re.code != 200)
                                        checkApiSuccessOrSncakbar(re, "移除群组成员失败")
                                    EventBus.emit('GroupMembersList.updateMembers')
                                    snackbar({
                                        message: `已移除 ${nickname}`,
                                        placement: "top",
                                        action: "撤销操作",
                                        onActionClick: async () => {
                                            const re = await Client.invoke("User.addContacts", {
                                                token: data.access_token,
                                                targets: ls,
                                            })
                                            if (re.code != 200)
                                                checkApiSuccessOrSncakbar(re, "恢复所选收藏失败")
                                            EventBus.emit('ContactsList.updateContacts')
                                        }
                                    })
                                })()
                                return true
                            },
                        }
                    ],
                })}></mdui-button-icon>
            </div>
        </mdui-list-item>
    )
}
