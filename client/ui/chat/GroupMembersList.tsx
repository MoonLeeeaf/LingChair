import { TextField } from "mdui"
import useEventListener from "../useEventListener.ts"
import React from "react"
import useAsyncEffect from "../useAsyncEffect.ts"
import Client from "../../api/Client.ts"
import { checkApiSuccessOrSncakbar } from "../snackbar.ts"
import data from "../../Data.ts"
import EventBus from "../../EventBus.ts"
import GroupMembersListItem from "./GroupMembersListItem.tsx"
import User from "../../api/client_data/User.ts"
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
    const [groupMembers, setGroupMembers] = React.useState<User[]>([])

    useEventListener(searchRef, 'input', (e) => {
        setSearchText((e.target as unknown as TextField).value)
    })

    React.useEffect(() => {
        async function updateMembers() {
            const re = await Client.invoke("Chat.getMembers", {
                token: data.access_token,
                target: target,
            })
            if (re.code != 200)
                return checkApiSuccessOrSncakbar(re, "获取群组成员列表失败")

            setGroupMembers(re.data!.members as User[])
        }
        updateMembers()
        EventBus.on('GroupMembersList.updateMembers', () => updateMembers())
        const id = setTimeout(() => updateMembers(), 15 * 1000)
        return () => {
            clearTimeout(id)
            EventBus.off('GroupMembersList.updateMembers')
        }
    }, [target])

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
        }} icon="refresh" onClick={() => EventBus.emit('GroupMembersList.updateMembers')}>刷新</mdui-list-item>

        {
            groupMembers.filter((user) =>
                searchText == '' ||
                user.nickname.includes(searchText) ||
                user.username?.includes(searchText) ||
                user.id.includes(searchText)
            ).map((v) =>
                <GroupMembersListItem
                    key={v.id}
                    user={v} />
            )
        }
    </mdui-list>
}