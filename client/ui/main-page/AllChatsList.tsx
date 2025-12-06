import { TextField } from "mdui"
import React from "react"
import AllChatsListItem from "./AllChatsListItem.tsx"
import useEventListener from "../../utils/useEventListener.ts"
import useAsyncEffect from "../../utils/useAsyncEffect.ts"
import { CallbackError, Chat, User, UserMySelf } from "lingchair-client-protocol"
import getClient from "../../getClient.ts"
import showSnackbar from "../../utils/showSnackbar.ts"
import isMobileUI from "../../utils/isMobileUI.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    display: boolean
    currentChatId: string
    openChatInfoDialog: (chat: Chat) => void
}

export default function AllChatsList({ ...props }: React.HTMLAttributes<HTMLElement>) {
    
    const searchRef = React.useRef<HTMLElement>(null)
    const [searchText, setSearchText] = React.useState('')
    const [allChatsList, setAllChatsList] = React.useState<Chat[]>([])

    useEventListener(searchRef, 'input', (e) => {
        setSearchText((e.target as unknown as TextField).value)
    })

    useAsyncEffect(async () => {
        async function updateAllChats() {
            try {
                setAllChatsList(await (await UserMySelf.getMySelfOrThrow(getClient())).getMyAllChatsOrThrow())
            } catch (e) {
                if (e instanceof CallbackError)
                    if (e.code == 401 || e.code == 400)
                        showSnackbar({
                            message: '获取所有对话失败: ' + e.message
                        })
            }
        }
        updateAllChats()
        return () => {
        }
    })

    return <mdui-list style={{
        overflowY: 'auto',
        paddingRight: '10px',
        paddingLeft: '10px',
        paddingTop: '0',
        height: '100%',
        width: '100%',
    }} {...props}>
        <mdui-text-field icon="search" type="search" clearable ref={searchRef} variant="outlined" placeholder="搜索..." style={{
            paddingTop: '12px',
            paddingBottom: '13px',
            position: 'sticky',
            top: '0',
            backgroundColor: 'rgb(var(--mdui-color-background))',
            zIndex: '10',
        }}></mdui-text-field>
        {
            allChatsList.filter((chat) =>
                searchText == '' ||
                chat.getTitle().includes(searchText) ||
                chat.getId().includes(searchText)
            ).map((v) =>
                <AllChatsListItem
                    active={isMobileUI() ? false : currentChatId == v.getId()}
                    key={v.getId()}
                    onClick={() => {
                        openChatInfoDialog(v)
                    }}
                    chat={v} />
            )
        }
    </mdui-list>
}