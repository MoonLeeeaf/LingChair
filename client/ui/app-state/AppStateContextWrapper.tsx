import { $, Dialog } from "mdui"
import AppStateContext, { AppState } from "./AppStateContext"
import { Chat, User } from "lingchair-client-protocol"
import getClient from "../../getClient"
import UserOrChatInfoDialog from "./UserOrChatInfoDialog"
import useEffectRef from "../../utils/useEffectRef"
import EditMyProfileDialog from "./EditMyProfileDialog"
import AddFavourtieChatDialog from "./AddFavourtieChatDialog"
import * as React from 'react'
import { useContextSelector } from "use-context-selector"
import MainSharedContext, { Shared } from "../MainSharedContext"
import ChatFragmentDialog from "./ChatFragmentDialog"
import useAsyncEffect from "../../utils/useAsyncEffect"
import ClientCache from "../../ClientCache"
import isMobileUI from "../../utils/isMobileUI"

const config = await fetch('/config.json').then((re) => re.json())

export default function DialogContextWrapper({ children, useRef }: { children: React.ReactNode, useRef: React.MutableRefObject<AppState | undefined> }) {
    const [userOrChatInfoDialogState, setUserOrChatInfoDialogState] = React.useState<Chat[]>([])
    const lastUserOrChatInfoDialogStateRef = React.useRef<Chat>()
    const userOrChatInfoDialogRef = useEffectRef<Dialog>((ref) => {
        ref.current!.addEventListener('closed', () => {
            setUserOrChatInfoDialogState([])
        })
        ref.current!.addEventListener('overlay-click', () => {
            ref.current!.open = false
        })
    }, [])
    React.useEffect(() => {
        userOrChatInfoDialogState.length != 0 && (lastUserOrChatInfoDialogStateRef.current = userOrChatInfoDialogState[userOrChatInfoDialogState.length - 1])
        userOrChatInfoDialogRef.current!.open = userOrChatInfoDialogState.length != 0
    }, [userOrChatInfoDialogState])

    const editMyProfileDialogRef = React.useRef<Dialog>()
    const addFavouriteChatDialogRef = React.useRef<Dialog>()

    const setCurrentSelectedChatId = useContextSelector(
        MainSharedContext,
        (context: Shared) => context.setCurrentSelectedChatId
    )
    const currentSelectedChatId = useContextSelector(
        MainSharedContext,
        (context: Shared) => context.state.currentSelectedChatId
    )
    const chatFragmentDialogRef = React.useRef<Dialog>()

    useAsyncEffect(async () => {
        document.title = (currentSelectedChatId && currentSelectedChatId != '' && await ClientCache.getChat(currentSelectedChatId).then((v) => v?.getTitle()) + ' | ') + (config.title || 'LingChair')
    }, [currentSelectedChatId])

    return <AppStateContext.Provider value={useRef.current = class {
        static async openChatInfo(chat: Chat | string) {
            if (!(chat instanceof Chat))
                chat = (await Chat.getById(getClient(), chat))!

            setUserOrChatInfoDialogState([...userOrChatInfoDialogState, chat])
        }
        static async openUserInfo(user: Chat | User | string) {
            if (typeof user == 'string') user = (await Chat.getOrCreatePrivateChat(getClient(), user))!
            else if (user instanceof User) user = (await Chat.getOrCreatePrivateChat(getClient(), user.getId()))!
            return this.openChatInfo(user)
        }
        static openEditMyProfile() {
            editMyProfileDialogRef.current!.open = true
        }
        static openAddFavouriteChat() {
            addFavouriteChatDialogRef.current!.open = true
        }
        static async openChat(chat: string | Chat, inDialog?: boolean) {
            if (chat instanceof Chat) chat = chat.getId()

            setUserOrChatInfoDialogState([])
            setCurrentSelectedChatId(chat)

            inDialog && (chatFragmentDialogRef.current!.open = true)
        }
        static closeChat() {
            if (chatFragmentDialogRef.current!.open) {
                chatFragmentDialogRef.current!.open = false
                $(chatFragmentDialogRef.current!).one('closed', () => setCurrentSelectedChatId(''))
            }
            else
                setCurrentSelectedChatId('')
        }
    }}>
        {<ChatFragmentDialog chatId={currentSelectedChatId} useRef={chatFragmentDialogRef} />}
        <UserOrChatInfoDialog chat={userOrChatInfoDialogState[userOrChatInfoDialogState.length - 1] || lastUserOrChatInfoDialogStateRef.current} useRef={userOrChatInfoDialogRef} />
        <EditMyProfileDialog useRef={editMyProfileDialogRef} />
        <AddFavourtieChatDialog useRef={addFavouriteChatDialogRef} />
        {children}
    </AppStateContext.Provider>
}
