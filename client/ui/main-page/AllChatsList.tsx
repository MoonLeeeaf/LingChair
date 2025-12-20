import { TextField } from "mdui"
import React from "react"
import AllChatsListItem from "./AllChatsListItem.tsx"
import useEventListener from "../../utils/useEventListener.ts"
import useAsyncEffect from "../../utils/useAsyncEffect.ts"
import { CallbackError, Chat } from "lingchair-client-protocol"
import showSnackbar from "../../utils/showSnackbar.ts"
import isMobileUI from "../../utils/isMobileUI.ts"
import { useContextSelector } from "use-context-selector"
import MainSharedContext, { Shared } from "../MainSharedContext.ts"
import ClientCache from "../../ClientCache.ts"
import gotoChatInfo from "../routers/gotoChatInfo.ts"
import { useNavigate } from "react-router"

export default function AllChatsList({ ...props }: React.HTMLAttributes<HTMLElement>) {
    const shared = useContextSelector(MainSharedContext, (context: Shared) => ({
        functions_lazy: context.functions_lazy,
        state: context.state,
    }))

    const searchRef = React.useRef<HTMLElement>(null)
    const [searchText, setSearchText] = React.useState('')
    const [allChatsList, setAllChatsList] = React.useState<Chat[]>([])

    const nav = useNavigate()

    useEventListener(searchRef, 'input', (e) => {
        setSearchText((e.target as unknown as TextField).value)
    })

    useAsyncEffect(async () => {
        async function updateAllChats() {
            try {
                setAllChatsList(await (await ClientCache.getMySelf())!.getMyAllChatsOrThrow())
            } catch (e) {
                if (e instanceof CallbackError)
                    if (e.code != 401 && e.code != 400)
                        showSnackbar({
                            message: '获取所有对话失败: ' + e.message
                        })
            }
        }
        updateAllChats()

        shared.functions_lazy.current.updateAllChats = updateAllChats

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
        ...props?.style,
    }} {...props}>
        <mdui-text-field icon="search" type="search" clearable ref={searchRef} variant="outlined" placeholder="搜索..." style={{
            padding: isMobileUI() ? '12px' : undefined,
            paddingTop: '4px',
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
                    active={isMobileUI() ? false : shared.state.currentSelectedChatId == v.getId()}
                    key={v.getId()}
                    onClick={() => {
                        gotoChatInfo(nav, v.getId())
                    }}
                    chat={v} />
            )
        }
    </mdui-list>
}