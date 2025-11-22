import { $ } from "mdui/jq"
import Avatar from "../Avatar.tsx"
import React from 'react'
import JoinRequest from "../../api/client_data/JoinRequest.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    joinRequest: JoinRequest
    acceptJoinRequest: (userId: string) => any
    removeJoinRequest: (userId: string) => any
}

export default function JoinRequestsListItem({ joinRequest, acceptJoinRequest, removeJoinRequest }: Args) {
    const { user_id, title, avatar, reason } = joinRequest

    const itemRef = React.useRef<HTMLElement>(null)
    React.useEffect(() => {
        $(itemRef.current!.shadowRoot).find('.headline').css('margin-top', '3px')
    })
    return (
        <mdui-list-item rounded style={{
            marginTop: '3px',
            marginBottom: '3px',
        }} ref={itemRef}>
            {title}
            <Avatar src={avatar} text={title} slot="icon" />
            <span slot="description"
                style={{
                    width: "100%",
                    display: "inline-block",
                    whiteSpace: "nowrap", /* 禁止换行 */
                    overflow: "hidden", /* 隐藏溢出内容 */
                    textOverflow: "ellipsis", /* 显示省略号 */
                }}>请求原因: {reason || "无"}</span>
            <div slot="end-icon">
                <mdui-button-icon icon="check" onClick={() => acceptJoinRequest(user_id)}></mdui-button-icon>
                <mdui-button-icon icon="delete" onClick={() => removeJoinRequest(user_id)}></mdui-button-icon>
            </div>
        </mdui-list-item>
    )
}
