import { TextField } from "mdui"
import RecentsListItem from "./RecentsListItem.tsx"
import React from "react"
import RecentChat from "lingchair-client-protocol/RecentChat.ts"
import { data } from "react-router"
import isMobileUI from "../../utils/isMobileUI.ts"
import useAsyncEffect from "../../utils/useAsyncEffect.ts"
import useEventListener from "../../utils/useEventListener.ts"
import { CallbackError } from "lingchair-client-protocol"
import { useContextSelector } from "use-context-selector"
import showSnackbar from "../../utils/showSnackbar.ts"
import MainSharedContext, { Shared } from "../MainSharedContext.ts"
import ClientCache from "../../ClientCache.ts"

export default function RecentChatsList({ ...props }: React.HTMLAttributes<HTMLElement>) {
    const shared = useContextSelector(MainSharedContext, (context: Shared) => ({
        functions_lazy: context.functions_lazy,
        state: context.state,
    }))

    const searchRef = React.useRef<HTMLElement>(null)
    const [searchText, setSearchText] = React.useState('')
    const [recentsList, setRecentsList] = React.useState<RecentChat[]>([])

    useEventListener(searchRef, 'input', (e) => {
        setSearchText((e.target as unknown as TextField).value)
    })

    useAsyncEffect(async () => {
        async function updateRecents() {
            try {
                setRecentsList(await (await ClientCache.getMySelf())!.getMyRecentChats())
            } catch (e) {
                if (e instanceof CallbackError)
                    if (e.code != 401 && e.code != 400)
                        showSnackbar({
                            message: '获取最近对话失败: ' + e.message
                        })
            }
        }
        updateRecents()

        shared.functions_lazy.current.updateRecentChats = updateRecents

        const id = setInterval(() => updateRecents(), 15 * 1000)
        return () => {
            clearInterval(id)
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
            paddingTop: '4px',
            marginBottom: '13px',
            position: 'sticky',
            top: '0',
            backgroundColor: 'rgb(var(--mdui-color-background))',
            zIndex: '10',
        }}></mdui-text-field>
        {
            recentsList.filter((chat) =>
                searchText == '' ||
                chat.getTitle().includes(searchText) ||
                chat.getId().includes(searchText) ||
                chat.getContent().includes(searchText)
            ).map((v) =>
                <RecentsListItem
                    active={isMobileUI() ? false : shared.state.currentSelectedChatId == v.getId()}
                    onClick={() => {}}
                    key={v.getId()}
                    recentChat={v} />
            )
        }
    </mdui-list>
}