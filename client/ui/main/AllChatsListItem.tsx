import { $ } from "mdui/jq"
import Avatar from "../Avatar.tsx"
import React from 'react'
import getUrlForFileByHash from "../../getUrlForFileByHash.ts"
import Chat from "../../api/client_data/Chat.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    chat: Chat
    active?: boolean
}

export default function AllChatsListItem({ chat, active, ...prop }: Args) {
    const { title, avatar_file_hash } = chat

    const ref = React.useRef<HTMLElement>(null)

    return (
        <mdui-list-item active={active} ref={ref} rounded style={{
            marginTop: '3px',
            marginBottom: '3px',
            width: '100%',
        }} {...prop as any}>
            <span style={{
                width: "100%",
            }}>{title}</span>
            <Avatar src={getUrlForFileByHash(avatar_file_hash as string)} text={title} slot="icon" />
        </mdui-list-item>
    )
}
