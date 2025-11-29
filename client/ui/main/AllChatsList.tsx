import { TextField } from "mdui"
import useEventListener from "../useEventListener.ts"
import RecentsListItem from "./RecentsListItem.tsx"
import React from "react"
import useAsyncEffect from "../useAsyncEffect.ts"
import Client from "../../api/Client.ts"
import { checkApiSuccessOrSncakbar } from "../snackbar.ts"
import data from "../../Data.ts"
import EventBus from "../../EventBus.ts"
import isMobileUI from "../isMobileUI.ts"
import Chat from "../../api/client_data/Chat.ts"
import AllChatsListItem from "./AllChatsListItem.tsx"

interface Args extends React.HTMLAttributes<HTMLElement> {
    display: boolean
    currentChatId: string
    openChatInfoDialog: (chat: Chat) => void
}

export default function AllChatsList({
    currentChatId,
    display,
    openChatInfoDialog,
    ...props
}: Args) {
    const searchRef = React.useRef<HTMLElement>(null)
    const [searchText, setSearchText] = React.useState('')
    const [allChatsList, setAllChatsList] = React.useState<Chat[]>([])

    useEventListener(searchRef, 'input', (e) => {
        setSearchText((e.target as unknown as TextField).value)
    })

    useAsyncEffect(async () => {
        async function updateAllChats() {
            const re = await Client.invoke("User.getMyAllChats", {
                token: data.access_token,
            })
            if (re.code != 200) {
                if (re.code != 401 && re.code != 400) checkApiSuccessOrSncakbar(re, "获取所有对话列表失败")
                return
            }

            setAllChatsList(re.data!.all_chats as Chat[])
        }
        updateAllChats()
        EventBus.on('AllChatsList.updateAllChats', () => updateAllChats())
        return () => {
            EventBus.off('AllChatsList.updateAllChats')
        }
    })

    return <mdui-list style={{
        overflowY: 'auto',
        paddingRight: '10px',
        paddingLeft: '10px',
        paddingTop: '0',
        display: display ? undefined : 'none',
        height: '100%',
        width: '100%',
    }} {...props}>
        <mdui-text-field icon="search" type="search" clearable ref={searchRef} variant="outlined" placeholder="搜索..." style={{
            paddingTop: '5px',
            paddingBottom: '13px',
            position: 'sticky',
            top: '0',
            backgroundColor: 'rgb(var(--mdui-color-background))',
            zIndex: '10',
        }}></mdui-text-field>
        {
            allChatsList.filter((chat) =>
                searchText == '' ||
                chat.title.includes(searchText) ||
                chat.id.includes(searchText)
            ).map((v) =>
                <AllChatsListItem
                    active={isMobileUI() ? false : currentChatId == v.id}
                    key={v.id}
                    onClick={() => {
                        openChatInfoDialog(v)
                    }}
                    chat={v} />
            )
        }
    </mdui-list>
}