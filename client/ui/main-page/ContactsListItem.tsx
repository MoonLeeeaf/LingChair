import Chat from "../../api/client_data/Chat.ts"
import getUrlForFileByHash from "../../getUrlForFileByHash.ts"
import Avatar from "../Avatar.tsx"
import React from 'react'

interface Args extends React.HTMLAttributes<HTMLElement> {
    contact: Chat
    active?: boolean
}

export default function ContactsListItem({ contact, ...prop }: Args) {
    const { id, title, avatar_file_hash } = contact
    const ref = React.useRef<HTMLElement>(null)

    return (
        <mdui-list-item ref={ref} rounded style={{
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
