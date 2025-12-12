import React from "react"
import FavouriteChatsListItem from "./FavouriteChatsListItem.tsx"
import { dialog, TextField } from "mdui"
import useAsyncEffect from "../../utils/useAsyncEffect.ts"
import useEventListener from "../../utils/useEventListener.ts"
import { CallbackError, Chat, UserMySelf } from "lingchair-client-protocol"
import showSnackbar from "../../utils/showSnackbar.ts"
import getClient from "../../getClient.ts"
import { useContextSelector } from "use-context-selector"
import MainSharedContext, { Shared } from "../MainSharedContext.ts"
import isMobileUI from "../../utils/isMobileUI.ts"

export default function FavouriteChatsList({ ...props }: React.HTMLAttributes<HTMLElement>) {
    const shared = useContextSelector(MainSharedContext, (context: Shared) => ({
        myProfileCache: context.myProfileCache,
        setShowAddFavourtieChatDialog: context.setShowAddFavourtieChatDialog,
        favouriteChats: context.favouriteChats,
        currentSelectedChatId: context.currentSelectedChatId,
        functions_lazy: context.functions_lazy,
    }))

    const searchRef = React.useRef<HTMLElement>(null)
    const [isMultiSelecting, setIsMultiSelecting] = React.useState(false)
    const [searchText, setSearchText] = React.useState('')
    const [favouriteChatsList, setFavouriteChatsList] = React.useState<Chat[]>([])
    const [checkedList, setCheckedList] = React.useState<{ [key: string]: boolean }>({})

    useEventListener(searchRef, 'input', (e) => {
        setSearchText((e.target as unknown as TextField).value)
    })

    useAsyncEffect(async () => {
        async function updateFavouriteChats() {
            try {
                const ls = await shared.myProfileCache!.getMyFavouriteChatsOrThrow()
                setFavouriteChatsList(ls)
                shared.favouriteChats
            } catch (e) {
                if (e instanceof CallbackError)
                    if (e.code != 401 && e.code != 400)
                        showSnackbar({
                            message: '获取收藏对话失败: ' + e.message
                        })
                console.log(e)
            }
        }
        updateFavouriteChats()

        shared.functions_lazy.current.updateFavouriteChats = updateFavouriteChats

        return () => {
        }
    }, [shared.myProfileCache])

    return <mdui-list style={{
        overflowY: 'auto',
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingTop: '0',
        height: '100%',
        width: '100%',
        ...props?.style,
    }} {...props}>
        <div style={{
            position: 'sticky',
            top: '0',
            backgroundColor: 'rgb(var(--mdui-color-background))',
            zIndex: '10',
        }}>
            <mdui-text-field icon="search" type="search" clearable ref={searchRef} variant="outlined" placeholder="搜索..." style={{
                paddingTop: '12px',
            }}></mdui-text-field>
            <mdui-list-item rounded style={{
                marginTop: '13px',
                width: '100%',
            }} icon="person_add" onClick={() => shared.setShowAddFavourtieChatDialog(true)}>添加收藏</mdui-list-item>
            <mdui-list-item rounded style={{
                width: '100%',
            }} icon="refresh" onClick={() => shared.functions_lazy.current.updateFavouriteChats()}>刷新列表</mdui-list-item>
            <mdui-list-item rounded style={{
                width: '100%',
            }} icon={isMultiSelecting ? "done" : "edit"} onClick={() => {
                if (isMultiSelecting)
                    setCheckedList({})
                setIsMultiSelecting(!isMultiSelecting)
            }}>{isMultiSelecting ? "关闭多选" : "多选模式"}</mdui-list-item>
            {
                isMultiSelecting && <>
                    <mdui-list-item rounded style={{
                        width: '100%',
                    }} icon="delete" onClick={() => dialog({
                        headline: "移除收藏对话",
                        description: "确定将所选对话从收藏中移除吗? 这不会导致对话被删除.",
                        closeOnEsc: true,
                        closeOnOverlayClick: true,
                        actions: [
                            {
                                text: "取消",
                                onClick: () => {
                                    return true
                                },
                            },
                            {
                                text: "确定",
                                onClick: async () => {
                                    const ls = Object.keys(checkedList).filter((chatId) => checkedList[chatId] == true)

                                    try {
                                        shared.myProfileCache!.removeFavouriteChatsOrThrow(ls)

                                        setCheckedList({})
                                        setIsMultiSelecting(false)

                                        shared.functions_lazy.current.updateFavouriteChats()

                                        showSnackbar({
                                            message: "已删除所选",
                                            action: "撤销操作",
                                            onActionClick: async () => {
                                                try {
                                                    shared.myProfileCache!.addFavouriteChatsOrThrow(ls)
                                                } catch (e) {
                                                    if (e instanceof CallbackError)
                                                        showSnackbar({
                                                            message: '撤销删除收藏失败: ' + e.message
                                                        })
                                                }
                                                shared.functions_lazy.current.updateFavouriteChats()
                                            }
                                        })
                                    } catch (e) {
                                        if (e instanceof CallbackError)
                                            showSnackbar({
                                                message: '删除收藏对话失败: ' + e.message
                                            })
                                    }
                                },
                            }
                        ],
                    })}>删除所选</mdui-list-item>
                </>
            }
            <div style={{
                height: "10px",
            }}></div>
        </div>

        {
            favouriteChatsList.filter((chat) =>
                searchText == '' ||
                chat.getTitle().includes(searchText) ||
                chat.getId().includes(searchText)
            ).map((v) =>
                <FavouriteChatsListItem
                    active={isMultiSelecting ? checkedList[v.getId()] == true : (isMobileUI() ? false : shared.currentSelectedChatId == v.getId())}
                    onClick={() => {
                        if (isMultiSelecting)
                            setCheckedList({
                                ...checkedList,
                                [v.getId()]: !checkedList[v.getId()],
                            })
                        else
                            openChatInfoDialog(v)
                    }}
                    key={v.getId()}
                    chat={v} />
            )
        }
    </mdui-list>
}