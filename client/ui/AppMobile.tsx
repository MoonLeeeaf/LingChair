import Client from "../api/Client.ts"
import data from "../Data.ts"
import ChatFragment from "./chat/ChatFragment.tsx"
import useEventListener from './useEventListener.ts'
import User from "../api/client_data/User.ts"
import RecentChat from "../api/client_data/RecentChat.ts"
import Avatar from "./Avatar.tsx"

import * as React from 'react'
import { Dialog, NavigationBar, TextField } from "mdui"
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

export default function AppMobile() {
    const [navigationItemSelected, setNavigationItemSelected] = React.useState('Recents')

    const navigationBarRef = React.useRef<NavigationBar>(null)
    useEventListener(navigationBarRef, 'change', (event) => {
        setNavigationItemSelected((event.target as HTMLElement as NavigationBar).value as string)
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

    const addContactDialogRef = React.useRef<Dialog>(null)
    const createGroupDialogRef = React.useRef<Dialog>(null)

    const chatInfoDialogRef = React.useRef<Dialog>(null)
    const [chatInfo, setChatInfo] = React.useState(null as unknown as Chat)

    const userProfileDialogRef = React.useRef<Dialog>(null)
    const [userInfo, setUserInfo] = React.useState(null as unknown as User)

    const [myUserProfileCache, setMyUserProfileCache] = React.useState(null as unknown as User)

    const [isShowChatFragment, setIsShowChatFragment] = React.useState(false)

    const [currentChatId, setCurrentChatId] = React.useState('')

    const [sharedFavouriteChats, setSharedFavouriteChats] = React.useState<Chat[]>([])

    const chatFragmentDialogRef = React.useRef<Dialog>(null)
    React.useEffect(() => {
        const shadow = chatFragmentDialogRef.current!.shadowRoot as ShadowRoot
        const panel = shadow.querySelector(".panel") as HTMLElement
        panel.style.padding = '0'
        panel.style.color = 'inherit'
        panel.style.backgroundColor = 'rgb(var(--mdui-color-background))'
        panel.style.setProperty('--mdui-color-background', 'inherit')
        const body = shadow.querySelector(".body") as HTMLElement
        body.style.height = '100%'
        body.style.display = 'flex'
    })

    useAsyncEffect(async () => {
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

    return (
        <div style={{
            display: "flex",
            position: 'relative',
            flexDirection: 'column',
            width: 'var(--whitesilk-window-width)',
            height: 'var(--whitesilk-window-height)',
        }}>
            <mdui-dialog fullscreen open={isShowChatFragment} ref={chatFragmentDialogRef}>
                {
                    // 聊天页面
                }
                <div id="ChatFragment" style={{
                    width: '100%',
                    height: '100%',
                }}>
                    <ChatFragment
                        showReturnButton={true}
                        openUserInfoDialog={openUserInfoDialog}
                        onReturnButtonClicked={() => setIsShowChatFragment(false)}
                        key={currentChatId}
                        openChatInfoDialog={openChatInfoDialog}
                        target={currentChatId} />
                </div>
            </mdui-dialog>

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
                openUserInfoDialog={openUserInfoDialog}
                sharedFavouriteChats={sharedFavouriteChats}
                openChatFragment={(id) => {
                    setCurrentChatId(id)
                    setIsShowChatFragment(true)
                }}
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

            <mdui-top-app-bar style={{
                position: 'sticky',
                marginTop: '3px',
                marginRight: '6px',
                marginLeft: '15px',
                top: '0px',
            }}>
                <mdui-top-app-bar-title>{
                    ({
                        Recents: "最近对话",
                        Contacts: "所有对话"
                    })[navigationItemSelected]
                }</mdui-top-app-bar-title>
                <div style={{
                    flexGrow: 1,
                }}></div>
                <mdui-button-icon icon="settings"></mdui-button-icon>
                <mdui-button-icon>
                    <Avatar src={getUrlForFileByHash(myUserProfileCache?.avatar_file_hash)} text={myUserProfileCache?.nickname} avatarRef={openMyProfileDialogButtonRef} />
                </mdui-button-icon>
            </mdui-top-app-bar>
            {
                // 侧边列表
            }
            <div style={{
                display: 'flex',
                height: 'calc(100% - 80px - 67px)',
                width: '100%',
            }} id="SideBar">
                {
                    // 最近聊天
                    <RecentsList
                        openChatFragment={(id) => {
                            setCurrentChatId(id)
                            setIsShowChatFragment(true)
                        }}
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
            <mdui-navigation-bar label-visibility="selected" value="Recents" ref={navigationBarRef} style={{
                position: 'sticky',
                bottom: '0',
            }}>
                <mdui-navigation-bar-item icon="watch_later--outlined" active-icon="watch_later--filled" value="Recents">最近对话</mdui-navigation-bar-item>
                <mdui-navigation-bar-item icon="chat--outlined" active-icon="chat--filled" value="Contacts">所有对话</mdui-navigation-bar-item>
            </mdui-navigation-bar>
        </div>
    )
}