import { $ } from "mdui/jq"
import Avatar from "../Avatar.tsx"
import React from 'react'
import User from "../../api/client_data/User.ts"
import getUrlForFileByHash from "../../getUrlForFileByHash.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    user: User
}

export default function GroupMembersListItem({ user }: Args) {
    const { nickname, avatar_file_hash } = user

    const itemRef = React.useRef<HTMLElement>(null)
    return (
        <mdui-list-item rounded style={{
            marginTop: '3px',
            marginBottom: '3px',
        }} ref={itemRef}>
            {nickname}
            <Avatar src={getUrlForFileByHash(avatar_file_hash)} text={nickname} slot="icon" />
            {/* <div slot="end-icon">
                <mdui-button-icon icon="check"></mdui-button-icon>
                <mdui-button-icon icon="delete"></mdui-button-icon>
            </div> */}
        </mdui-list-item>
    )
}
