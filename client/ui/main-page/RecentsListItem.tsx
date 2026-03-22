import { $ } from "mdui/jq"
import Avatar from "../Avatar.tsx"
import React from 'react'
import getClient from "../../getClient.ts"
import RecentChat from "lingchair-client-protocol/RecentChat.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    recentChat: RecentChat
    active?: boolean
}

export default function RecentsListItem({ recentChat, active, ...props }: Args) {
    const { id, title, avatar_file_hash, content } = recentChat.bean

    const itemRef = React.useRef<HTMLElement>(null)
    React.useEffect(() => {
        $(itemRef.current!.shadowRoot).find('.headline').css('margin-top', '3px')
    })
    return (
        <mdui-list-item rounded style={{
            marginTop: '3px',
            marginBottom: '3px',
        }} active={active} ref={itemRef} {...props as any}>
            {title}
            <Avatar src={getClient().getUrlForFileByHash(avatar_file_hash!)} text={title} slot="icon" />
            <span slot="description"
                style={{
                    width: "100%",
                    display: "inline-block",
                    whiteSpace: "nowrap", /* 禁止换行 */
                    overflow: "hidden", /* 隐藏溢出内容 */
                    textOverflow: "ellipsis", /* 显示省略号 */
                }}>{content}</span>
        </mdui-list-item>
    )
}
