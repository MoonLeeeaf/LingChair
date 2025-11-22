import { TextField } from "mdui"
import useEventListener from "../useEventListener.ts"
import React from "react"
import Client from "../../api/Client.ts"
import { checkApiSuccessOrSncakbar } from "../snackbar.ts"
import data from "../../Data.ts"
import EventBus from "../../EventBus.ts"
import JoinRequest from "../../api/client_data/JoinRequest.ts"
import JoinRequestsListItem from "./JoinRequestsListItem.tsx"
import Chat from "../../api/client_data/Chat.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    chat: Chat
}

export default function GroupMembersList({
    chat,
    ...props
}: Args) {
    const target = chat.id
    const searchRef = React.useRef<HTMLElement>(null)
    const [searchText, setSearchText] = React.useState('')
    const [updateJoinRequests, setUpdateJoinRequests] = React.useState<JoinRequest[]>([])

    useEventListener(searchRef, 'input', (e) => {
        setSearchText((e.target as unknown as TextField).value)
    })

    React.useEffect(() => {
        async function updateJoinRequests() {
            const re = await Client.invoke("Chat.getJoinRequests", {
                token: data.access_token,
                target: target,
            })
            if (re.code != 200)
                return checkApiSuccessOrSncakbar(re, "获取加入请求列表失败")

            setUpdateJoinRequests(re.data!.join_requests as JoinRequest[])
        }
        updateJoinRequests()
        EventBus.on('JoinRequestsList.updateJoinRequests', () => updateJoinRequests())
        const id = setTimeout(() => updateJoinRequests(), 15 * 1000)
        return () => {
            clearTimeout(id)
            EventBus.off('JoinRequestsList.updateJoinRequests')
        }
    }, [target])

    async function removeJoinRequest(userId: string) {
        const re = await Client.invoke("Chat.processJoinRequest", {
            token: data.access_token,
            chat_id: target,
            user_id: userId,
            action: 'remove',
        })
        if (re.code != 200)
            return checkApiSuccessOrSncakbar(re, "删除加入请求失败")

        EventBus.emit('JoinRequestsList.updateJoinRequests')
    }
    async function acceptJoinRequest(userId: string) {
        const re = await Client.invoke("Chat.processJoinRequest", {
            token: data.access_token,
            chat_id: target,
            user_id: userId,
            action: 'accept',
        })
        if (re.code != 200)
            return checkApiSuccessOrSncakbar(re, "通过加入请求失败")

        EventBus.emit('JoinRequestsList.updateJoinRequests')
    }

    return <mdui-list style={{
        overflowY: 'auto',
        paddingRight: '10px',
        paddingLeft: '10px',
        height: '100%',
        width: '100%',
    }} {...props}>
        <mdui-text-field icon="search" type="search" clearable ref={searchRef} variant="outlined" placeholder="搜索..." style={{
            marginTop: '5px',
            marginBottom: '13px',
        }}></mdui-text-field>

        <mdui-list-item rounded style={{
            width: '100%',
            marginBottom: '15px',
        }} icon="refresh" onClick={() => EventBus.emit('JoinRequestsList.updateJoinRequests')}>刷新</mdui-list-item>

        {
            updateJoinRequests.filter((joinRequest) =>
                searchText == '' ||
                joinRequest.title.includes(searchText) ||
                joinRequest.reason?.includes(searchText) ||
                joinRequest.user_id.includes(searchText)
            ).map((v) =>
                <JoinRequestsListItem
                    key={v.user_id}
                    acceptJoinRequest={acceptJoinRequest}
                    removeJoinRequest={removeJoinRequest}
                    joinRequest={v} />
            )
        }
    </mdui-list>
}