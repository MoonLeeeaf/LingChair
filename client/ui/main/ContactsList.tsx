import React from "react"
import ContactsListItem from "./ContactsListItem.tsx"
import useEventListener from "../useEventListener.ts"
import { dialog, Dialog, TextField } from "mdui"
import Client from "../../api/Client.ts"
import data from "../../Data.ts"
import { checkApiSuccessOrSncakbar, snackbar } from "../snackbar.ts"
import Chat from "../../api/client_data/Chat.ts"
import EventBus from "../../EventBus.ts"
import isMobileUI from "../isMobileUI.ts";

interface Args extends React.HTMLAttributes<HTMLElement> {
    display: boolean
    openChatInfoDialog: (chat: Chat) => void
    addContactDialogRef: React.MutableRefObject<Dialog>
    createGroupDialogRef: React.MutableRefObject<Dialog>
    setSharedFavouriteChats: React.Dispatch<React.SetStateAction<Chat[]>>
    currentChatId: string
}

export default function ContactsList({
    display,
    openChatInfoDialog,
    addContactDialogRef,
    createGroupDialogRef,
    setSharedFavouriteChats,
    currentChatId,
    ...props
}: Args) {
    const searchRef = React.useRef<HTMLElement>(null)
    const [isMultiSelecting, setIsMultiSelecting] = React.useState(false)
    const [searchText, setSearchText] = React.useState('')
    const [contactsList, setContactsList] = React.useState<Chat[]>([])
    const [checkedList, setCheckedList] = React.useState<{ [key: string]: boolean }>({})

    useEventListener(searchRef, 'input', (e) => {
        setSearchText((e.target as unknown as TextField).value)
    })

    React.useEffect(() => {
        async function updateContacts() {
            const re = await Client.invoke("User.getMyContacts", {
                token: data.access_token,
            })
            if (re.code != 200) {
                if (re.code != 401 && re.code != 400) checkApiSuccessOrSncakbar(re, "获取收藏对话列表失败")
                return
            }
            const ls = re.data!.contacts_list as Chat[]
            setContactsList(ls)
            setSharedFavouriteChats(ls)
        }
        updateContacts()
        EventBus.on('ContactsList.updateContacts', () => updateContacts())
        return () => {
            EventBus.off('ContactsList.updateContacts')
        }
        // 警告: 不添加 deps 導致無限執行
    }, [])

    return <mdui-list style={{
        overflowY: 'auto',
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingTop: '0',
        display: display ? undefined : 'none',
        height: '100%',
        width: '100%',
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
            }} icon="person_add" onClick={() => addContactDialogRef.current!.open = true}>添加收藏对话</mdui-list-item>
            <mdui-list-item rounded style={{
                width: '100%',
            }} icon="refresh" onClick={() => EventBus.emit('ContactsList.updateContacts')}>刷新</mdui-list-item>
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
                        headline: "删除所选",
                        description: "确定要删除所选的收藏对话吗? 这并不会删除您的聊天记录, 也不会丢失对话成员身份",
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
                                    const re = await Client.invoke("User.removeContacts", {
                                        token: data.access_token,
                                        targets: ls,
                                    })
                                    if (re.code != 200)
                                        checkApiSuccessOrSncakbar(re, "删除所选收藏失败")
                                    else {
                                        setCheckedList({})
                                        setIsMultiSelecting(false)
                                        EventBus.emit('ContactsList.updateContacts')
                                        snackbar({
                                            message: "已删除所选",
                                            placement: "top",
                                            action: "撤销操作",
                                            onActionClick: async () => {
                                                const re = await Client.invoke("User.addContacts", {
                                                    token: data.access_token,
                                                    targets: ls,
                                                })
                                                if (re.code != 200)
                                                    checkApiSuccessOrSncakbar(re, "恢复所选收藏失败")
                                                EventBus.emit('ContactsList.updateContacts')
                                            }
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
            contactsList.filter((chat) =>
                searchText == '' ||
                chat.title.includes(searchText) ||
                chat.id.includes(searchText)
            ).map((v) =>
                <ContactsListItem
                    active={isMultiSelecting ? checkedList[v.id] == true : (isMobileUI() ? false : currentChatId == v.id)}
                    onClick={() => {
                        if (isMultiSelecting)
                            setCheckedList({
                                ...checkedList,
                                [v.id]: !checkedList[v.id],
                            })
                        else
                            openChatInfoDialog(v)
                    }}
                    key={v.id}
                    contact={v} />
            )
        }
    </mdui-list>
}