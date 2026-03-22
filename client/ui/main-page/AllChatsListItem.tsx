import { $ } from "mdui/jq"
import Avatar from "../Avatar.tsx"
import React from 'react'
import { Chat } from "lingchair-client-protocol"
import getClient from "../../getClient.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    chat: Chat
    active?: boolean
}

export default function AllChatsListItem({ chat, active }: Args) {
    const title = chat.getTitle()

    const ref = React.useRef<HTMLElement>(null)

    return (
        <mdui-list-item active={active} ref={ref} rounded style={{
            marginTop: '3px',
            marginBottom: '3px',
            width: '100%',
        }}>
            <span style={{
                width: "100%",
            }}>{title}</span>
            <Avatar src={getClient().getUrlForFileByHash(chat.getAvatarFileHash() as string)} text={title} slot="icon" />
        </mdui-list-item>
    )
}
