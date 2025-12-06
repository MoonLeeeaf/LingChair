import { $ } from "mdui/jq"
import RecentChat from "../../api/client_data/RecentChat.ts"
import Avatar from "../Avatar.tsx"
import React from 'react'
import getUrlForFileByHash from "../../getUrlForFileByHash.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    recentChat: RecentChat
    openChatFragment: (id: string) => void
    active?: boolean
}

export default function RecentsListItem({ recentChat, openChatFragment, active }: Args) {
    const { id, title, avatar_file_hash, content } = recentChat

    const itemRef = React.useRef<HTMLElement>(null)
    React.useEffect(() => {
        $(itemRef.current!.shadowRoot).find('.headline').css('margin-top', '3px')
    })
    return (
        <mdui-list-item rounded style={{
            marginTop: '3px',
            marginBottom: '3px',
        }} onClick={() => openChatFragment(id)} active={active} ref={itemRef}>
            {title}
            <Avatar src={getUrlForFileByHash(avatar_file_hash as string)} text={title} slot="icon" />
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
