import Client from "../api/Client.ts"
import data from "../Data.ts"
import ChatFragment from "./chat/ChatFragment.tsx"
import useEventListener from './useEventListener.ts'
import User from "../api/client_data/User.ts"
import RecentChat from "../api/client_data/RecentChat.ts"
import Avatar from "./Avatar.tsx"

import * as React from 'react'
import { Dialog, NavigationRail, TextField } from "mdui"
import Split from 'split.js'
import 'mdui/jsx.zh-cn.d.ts'
import { checkApiSuccessOrSncakbar } from "./snackbar.ts"

import RegisterDialog from "./dialog/RegisterDialog.tsx"
import LoginDialog from "./dialog/LoginDialog.tsx"
import MyProfileDialog from "./dialog/MyProfileDialog.tsx"
import ContactsList from "./main/ContactsList.tsx"
import RecentsList from "./main/RecentsList.tsx"
import useAsyncEffect from "./useAsyncEffect.ts"
import ChatInfoDialog from "./dialog/ChatInfoDialog.tsx"
import Chat from "../api/client_data/Chat.ts"
import AddContactDialog from './dialog/AddContactDialog.tsx'
import CreateGroupDialog from './dialog/CreateGroupDialog.tsx'
import UserProfileDialog from "./dialog/UserProfileDialog.tsx"
import DataCaches from "../api/DataCaches.ts"
import getUrlForFileByHash from "../getUrlForFileByHash.ts"
import Message from "../api/client_data/Message.ts"
import EventBus from "../EventBus.ts"

declare global {
    namespace React {
        namespace JSX {
            interface IntrinsicAttributes {
                id?: string
                slot?: string
            }
        }
    }
}

export default function App() {
    const [navigationItemSelected, setNavigationItemSelected] = React.useState('Recents')

    const navigationRailRef = React.useRef<NavigationRail>(null)
    useEventListener(navigationRailRef, 'change', (event) => {
        setNavigationItemSelected((event.target as HTMLElement as NavigationRail).value as string)
    })

    const loginDialogRef = React.useRef<Dialog>(null)
    const loginInputAccountRef = React.useRef<TextField>(null)
    const loginInputPasswordRef = React.useRef<TextField>(null)

    const registerDialogRef = React.useRef<Dialog>(null)
    const registerInputUserNameRef = React.useRef<TextField>(null)
    const registerInputNickNameRef = React.useRef<TextField>(null)
    const registerInputPasswordRef = React.useRef<TextField>(null)

    const myProfileDialogRef = React.useRef<Dialog>(null)
    const openMyProfileDialogButtonRef = React.useRef<HTMLElement>(null)
    useEventListener(openMyProfileDialogButtonRef, 'click', (_event) => {
        myProfileDialogRef.current!.open = true
    })

    const userProfileDialogRef = React.useRef<Dialog>(null)
    const [userInfo, setUserInfo] = React.useState(null as unknown as User)

    const addContactDialogRef = React.useRef<Dialog>(null)
    const createGroupDialogRef = React.useRef<Dialog>(null)

    const chatInfoDialogRef = React.useRef<Dialog>(null)
    const [chatInfo, setChatInfo] = React.useState(null as unknown as Chat)

    const [myUserProfileCache, setMyUserProfileCache] = React.useState(null as unknown as User)

    const [isShowChatFragment, setIsShowChatFragment] = React.useState(false)

    const [currentChatId, setCurrentChatId] = React.useState('')

    const [sharedFavouriteChats, setSharedFavouriteChats] = React.useState<Chat[]>([])

    useAsyncEffect(async () => {
        const split = Split(['#SideBar', '#ChatFragment'], {
            sizes: data.split_sizes ? data.split_sizes : [25, 75],
            minSize: [200, 400],
            gutterSize: 2,
            onDragEnd: function () {
                data.split_sizes = split.getSizes()
                data.apply()
            }
        })

        Client.connect()
        const re = await Client.auth(data.access_token || "")
        if (re.code == 401)
            loginDialogRef.current!.open = true
        else if (re.code != 200) {
            if (checkApiSuccessOrSncakbar(re, "验证失败")) return
        } else if (re.code == 200) {
            setMyUserProfileCache(Client.myUserProfile as User)
        }
    })

    function openChatInfoDialog(chat: Chat) {
        setChatInfo(chat)
        chatInfoDialogRef.current!.open = true
    }

    function openChatFragment(chatId: string) {
        setCurrentChatId(chatId)
        setIsShowChatFragment(true)
    }

    async function openUserInfoDialog(user: User | string) {
        if (typeof user == 'object') {
            setUserInfo(user)
        } else {
            setUserInfo(await DataCaches.getUserProfile(user))

        }
        userProfileDialogRef.current!.open = true
    }

    if ('Notification' in window) {
        Notification.requestPermission()
        React.useEffect(() => {
            interface OnMessageData {
                chat: string
                msg: Message
            }
            async function onMessage(_event: unknown) {
                EventBus.emit('RecentsList.updateRecents')

                const event = _event as OnMessageData
                if (currentChatId != event.chat) {
                    const chat = await DataCaches.getChatInfo(event.chat)
                    const user = await DataCaches.getUserProfile(event.msg.user_id)
                    const notification = new Notification(`${user.nickname} (对话: ${chat.title})`, {
                        icon: getUrlForFileByHash(chat.avatar_file_hash),
                        body: event.msg.text,
                    })
                    notification.addEventListener('click', () => {
                        setCurrentChatId(chat.id)
                        setIsShowChatFragment(true)
                        notification.close()
                    })
                }
            }
            Client.on('Client.onMessage', onMessage)
            return () => {
                Client.off('Client.onMessage', onMessage)
            }
        }, [currentChatId])
    }

    return (
        <div style={{
            display: "flex",
            position: 'relative',
            width: 'calc(var(--whitesilk-window-width) - 80px)',
            height: 'var(--whitesilk-window-height)',
        }}>
            <LoginDialog
                loginDialogRef={loginDialogRef}
                loginInputAccountRef={loginInputAccountRef}
                loginInputPasswordRef={loginInputPasswordRef}
                registerDialogRef={registerDialogRef} />

            <RegisterDialog
                registerDialogRef={registerDialogRef}
                registerInputUserNameRef={registerInputUserNameRef}
                registerInputNickNameRef={registerInputNickNameRef}
                registerInputPasswordRef={registerInputPasswordRef}
                loginInputAccountRef={loginInputAccountRef}
                loginInputPasswordRef={loginInputPasswordRef} />

            <ChatInfoDialog
                chatInfoDialogRef={chatInfoDialogRef as any}
                openChatFragment={openChatFragment}
                openUserInfoDialog={openUserInfoDialog}
                sharedFavouriteChats={sharedFavouriteChats}
                chat={chatInfo} />

            <MyProfileDialog
                myProfileDialogRef={myProfileDialogRef as any}
                user={myUserProfileCache} />
            <UserProfileDialog
                chatInfoDialogRef={chatInfoDialogRef as any}
                userProfileDialogRef={userProfileDialogRef as any}
                openChatFragment={openChatFragment}
                user={userInfo} />

            <AddContactDialog
                addContactDialogRef={addContactDialogRef} />

            <CreateGroupDialog
                createGroupDialogRef={createGroupDialogRef} />

            <mdui-navigation-rail contained value="Recents" ref={navigationRailRef}>
                <mdui-button-icon slot="top">
                    <Avatar src={getUrlForFileByHash(myUserProfileCache?.avatar_file_hash)} text={myUserProfileCache?.nickname} avatarRef={openMyProfileDialogButtonRef} />
                </mdui-button-icon>

                <mdui-navigation-rail-item icon="watch_later--outlined" active-icon="watch_later--filled" value="Recents"></mdui-navigation-rail-item>
                <mdui-navigation-rail-item icon="chat--outlined" active-icon="chat--filled" value="Contacts"></mdui-navigation-rail-item>

                <mdui-button-icon icon="settings" slot="bottom"></mdui-button-icon>
            </mdui-navigation-rail>
            {
                // 侧边列表
            }
            <div id="SideBar">
                {
                    // 最近聊天
                    <RecentsList
                        openChatFragment={openChatFragment}
                        display={navigationItemSelected == "Recents"}
                        currentChatId={currentChatId} />
                }
                {
                    // 對話列表
                    <ContactsList
                        openChatInfoDialog={openChatInfoDialog}
                        setSharedFavouriteChats={setSharedFavouriteChats}
                        addContactDialogRef={addContactDialogRef as any}
                        createGroupDialogRef={createGroupDialogRef as any}
                        display={navigationItemSelected == "Contacts"} />
                }
            </div>
            {
                // 聊天页面
            }
            <div id="ChatFragment" style={{
                display: "flex",
                width: '100%'
            }}>
                {
                    !isShowChatFragment && <div style={{
                        width: '100%',
                        textAlign: 'center',
                        alignSelf: 'center',
                    }}>
                        选择以开始对话......
                    </div>
                }
                {
                    isShowChatFragment && <ChatFragment
                        target={currentChatId}
                        openUserInfoDialog={openUserInfoDialog}
                        openChatInfoDialog={openChatInfoDialog}
                        key={currentChatId} />
                }
            </div>
        </div>
    )
}