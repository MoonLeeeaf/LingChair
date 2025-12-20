import isMobileUI from "../utils/isMobileUI.ts"
import useEventListener from "../utils/useEventListener.ts"
import AvatarMySelf from "./AvatarMySelf.tsx"
import MainSharedContext from './MainSharedContext.ts'
import * as React from 'react'
import { createBrowserRouter, Outlet, RouterProvider, useNavigate, useRouteError } from "react-router"
import LoginDialog from "./main-page/LoginDialog.tsx"
import useAsyncEffect from "../utils/useAsyncEffect.ts"
import performAuth from "../performAuth.ts"
import { CallbackError, Chat, UserMySelf } from "lingchair-client-protocol"
import showCircleProgressDialog from "./showCircleProgressDialog.ts"
import RegisterDialog from "./main-page/RegisterDialog.tsx"
import sleep from "../utils/sleep.ts"
import { $, dialog, NavigationDrawer } from "mdui"
import getClient from "../getClient.ts"
import showSnackbar from "../utils/showSnackbar.ts"
import AllChatsList from "./main-page/AllChatsList.tsx"
import FavouriteChatsList from "./main-page/FavouriteChatsList.tsx"
import RecentChatsList from "./main-page/RecentChatsList.tsx"
import UserOrChatInfoDialog from "./routers/UserOrChatInfoDialog.tsx"
import UserOrChatInfoDialogLoader from "./routers/UserOrChatInfoDialogDataLoader.ts"
import ChatInfoDialogDataLoader from "./routers/ChatInfoDialogDataLoader.ts"
import ChatFragmentDialog from "./routers/ChatFragmentDialog.tsx"
import EffectOnly from "./EffectOnly.tsx"
import MainSharedReducer from "./MainSharedReducer.ts"
import gotoUserInfo from "./routers/gotoUserInfo.ts"
import EditMyProfileDialog from "./routers/EditMyProfileDialog.tsx"
import ProgressDialogFallback from "./ProgressDialogFallback.tsx"
import Split from 'split.js'
import data from "../data.ts"
import LazyChatFragment from "./chat-fragment/LazyChatFragment.tsx"
import AddFavourtieChatDialog from "./routers/AddFavourtieChatDialog.tsx"
import RouterDialogsContextWrapper from './routers/RouterDialogsContextWrapper.tsx'

function Root() {
    const [myProfileCache, setMyProfileCache] = React.useState<UserMySelf>()

    // 多页面切换
    const navigationRef = React.useRef<HTMLElement>()
    const [currentShowPage, setCurrentShowPage] = React.useState('Recents')
    type HTMLElementWithValue = HTMLElement & { value: string }
    useEventListener(navigationRef, 'change', (event) => {
        setCurrentShowPage((event.target as HTMLElementWithValue).value)
    })

    const drawerRef = React.useRef<NavigationDrawer>()
    React.useEffect(() => {
        $(drawerRef.current!.shadowRoot).append(`
            <style>
                .panel {
                    width: 17.5rem !important;
                    display: flex !important;
                    flex-direction: column;
                }
            </style>
        `)
    }, [])

    const [showLoginDialog, setShowLoginDialog] = React.useState(false)
    const [showRegisterDialog, setShowRegisterDialog] = React.useState(false)

    const nav = useNavigate()

    const [state, dispatch] = React.useReducer(MainSharedReducer, {
        favouriteChats: [],
        currentSelectedChatId: '',
    })

    const sharedContext = {
        functions_lazy: React.useRef({
            updateFavouriteChats: () => { },
            updateRecentChats: () => { },
            updateAllChats: () => { },
        }),
        state,
        setFavouriteChats: (chats: Chat[]) => dispatch({ type: 'update_favourite_chat', data: chats }),

        setShowLoginDialog,
        setShowRegisterDialog,

        setCurrentSelectedChatId: (id: string) => dispatch({ type: 'update_selected_chat_id', data: id }),
    }

    useAsyncEffect(async () => {
        const waitingForAuth = showCircleProgressDialog("加载中...")
        try {
            await performAuth({})

            try {
                setMyProfileCache(await UserMySelf.getMySelfOrThrow(getClient()))
            } catch (e) {
                if (e instanceof CallbackError)
                    showSnackbar({
                        message: '获取资料失败: ' + e.message
                    })
            }
        } catch (e) {
            if (e instanceof CallbackError)
                if (e.code == 401 || e.code == 400)
                    setShowLoginDialog(true)
        }
        // 动画都没来得及, 稍微等一下 (
        await sleep(100)
        waitingForAuth.open = false
    })

    React.useEffect(() => {
        if (!isMobileUI()) {
            const split = Split(['#SideBar', '#ChatFragment'], {
                sizes: data.split_sizes ? data.split_sizes : [25, 75],
                minSize: [200, 400],
                gutterSize: 2,
                onDragEnd: function () {
                    data.split_sizes = split.getSizes()
                    data.apply()
                }
            })
        }
    }, [])

    return (
        <RouterDialogsContextWrapper>
            <MainSharedContext.Provider value={sharedContext}>
                <div style={{
                    display: "flex",
                    position: 'relative',
                    flexDirection: isMobileUI() ? 'column' : 'row',
                    width: '100%',
                    height: 'var(--whitesilk-window-height)',
                }}>
                    {
                        // 将子路由渲染到此处
                        <Outlet />
                    }
                    <LoginDialog open={showLoginDialog} />
                    <RegisterDialog open={showRegisterDialog} />
                    <mdui-navigation-drawer ref={drawerRef} modal close-on-esc close-on-overlay-click>
                        <mdui-list style={{
                            padding: '10px',
                        }}>
                            <mdui-list-item rounded onClick={() => gotoUserInfo(nav, myProfileCache!.getId())}>
                                <span>{myProfileCache?.getNickName()}</span>
                                <AvatarMySelf slot="icon" />
                            </mdui-list-item>
                            <mdui-list-item rounded icon="manage_accounts">账号设置</mdui-list-item>
                            <mdui-divider style={{
                                margin: '10px',
                            }}></mdui-divider>
                            <mdui-list-item rounded icon="settings">客户端设置</mdui-list-item>
                            <mdui-list-item rounded icon="person_add" onClick={() => nav('/add/favourite_chat')}>添加收藏对话</mdui-list-item>
                            <mdui-list-item rounded icon="group_add">创建新的群组</mdui-list-item>
                        </mdui-list>
                        <div style={{
                            flexGrow: 1,
                        }}></div>
                        <span style={{
                            padding: '10px',
                            fontSize: 'small',
                        }}>
                            LingChair Web v{__APP_VERSION__}<br />
                            Build: <a href={`https://codeberg.org/CrescentLeaf/LingChair/src/commit/${__GIT_HASH_FULL__}`}>{__GIT_HASH__}</a> ({__BUILD_TIME__})<br />
                            在 Codeberg 上<a href="https://codeberg.org/CrescentLeaf/LingChair">查看源代码</a>
                        </span>
                    </mdui-navigation-drawer>
                    {
                        /**
                         * Default: 侧边列表提供列表切换
                         */
                        !isMobileUI() ?
                            <mdui-navigation-rail ref={navigationRef} contained value="Recents">
                                <mdui-button-icon slot="top" icon="menu" onClick={() => drawerRef.current!.open = true}></mdui-button-icon>
    
                                <mdui-navigation-rail-item icon="watch_later--outlined" active-icon="watch_later--filled" value="Recents"></mdui-navigation-rail-item>
                                <mdui-navigation-rail-item icon="favorite_border" active-icon="favorite" value="Favourites"></mdui-navigation-rail-item>
                                <mdui-navigation-rail-item icon="chat--outlined" active-icon="chat--filled" value="AllChats"></mdui-navigation-rail-item>
                            </mdui-navigation-rail>
                            /**
                             * Mobile: 底部导航栏提供列表切换
                             */
                            : <mdui-top-app-bar style={{
                                position: 'sticky',
                                marginTop: '3px',
                                marginRight: '6px',
                                marginLeft: '15px',
                                top: '0px',
                            }}>
                                <mdui-button-icon icon="menu" onClick={() => drawerRef.current!.open = true}></mdui-button-icon>
                                <mdui-top-app-bar-title>{
                                    ({
                                        Recents: "最近对话",
                                        Favourites: "收藏对话",
                                        AllChats: "所有对话",
                                    })[currentShowPage]
                                }</mdui-top-app-bar-title>
                                <div style={{
                                    flexGrow: 1,
                                }}></div>
                            </mdui-top-app-bar>
                    }
                    {
                        /**
                         * Mobile: 指定高度的容器
                         * Default: 侧边列表
                         */
                        <div style={isMobileUI() ? {
                            height: 'calc(100% - 80px - 67px)',
                            marginLeft: '15px',
                            marginRight: '15px',
                            marginTop: '5px',
                            marginBottom: '5px',
                        } : {
                            paddingRight: '8px',
                        }} id="SideBar">
                            <RecentChatsList style={{
                                display: currentShowPage == 'Recents' ? undefined : 'none'
                            }} />
                            <FavouriteChatsList style={{
                                display: currentShowPage == 'Favourites' ? undefined : 'none'
                            }} />
                            <AllChatsList style={{
                                display: currentShowPage == 'AllChats' ? undefined : 'none'
                            }} />
                        </div>
                    }
                    {
                        !isMobileUI() && <div id="ChatFragment" style={{
                            display: "flex",
                            width: '100%'
                        }}>
                            {
                                (state.currentSelectedChatId && state.currentSelectedChatId != '')
                                    ? <LazyChatFragment openedWithRouter={false} chatId={state.currentSelectedChatId!} />
                                    : <div style={{
                                        width: '100%',
                                        textAlign: 'center',
                                        alignSelf: 'center',
                                    }}>
                                        选择以开始对话......
                                    </div>
                            }
                        </div>
                    }
                    {
                        /**
                         * Mobile: 底部导航栏提供列表切换
                         * Default: 侧边列表提供列表切换
                         */
                        isMobileUI() && <mdui-navigation-bar ref={navigationRef} label-visibility="selected" value="Recents" style={{
                            position: 'sticky',
                            bottom: '0',
                        }}>
                            <mdui-navigation-bar-item icon="watch_later--outlined" active-icon="watch_later--filled" value="Recents">最近对话</mdui-navigation-bar-item>
                            <mdui-navigation-bar-item icon="favorite_border" active-icon="favorite" value="Favourites">收藏对话</mdui-navigation-bar-item>
                            <mdui-navigation-bar-item icon="chat--outlined" active-icon="chat--filled" value="AllChats">全部对话</mdui-navigation-bar-item>
                        </mdui-navigation-bar>
                    }
                </div>
            </MainSharedContext.Provider>
        </RouterDialogsContextWrapper>
    )
}

function SnackbarErrorBoundary() {
    const error = useRouteError()
    return <EffectOnly effect={() => {
        const d = dialog({
            headline: "错误",
            description: error instanceof Error ? ('[' + error.name + '] ' + (error.stack || error.message)) : error + '',
            closeOnEsc: true,
            closeOnOverlayClick: true,
        })
        return () => {
            d.open = false
        }
    }} deps={[]} />
}

export default function Main() {
    const router = createBrowserRouter([{
        path: "/",
        Component: Root,
        hydrateFallbackElement: <ProgressDialogFallback text="请稍后..." />,
        ErrorBoundary: SnackbarErrorBoundary,
        children: [
            {
                path: 'info/:type',
                Component: UserOrChatInfoDialog,
                loader: UserOrChatInfoDialogLoader,
            },
            {
                path: 'add',
                children: [
                    {
                        path: 'favourite_chat',
                        Component: AddFavourtieChatDialog,
                    },
                ],
            },
            {
                path: 'settings',
                children: [
                    {
                        path: 'edit_profile',
                        Component: EditMyProfileDialog,
                    }
                ],
            },
            {
                path: 'chat',
                Component: ChatFragmentDialog,
                children: [
                    {
                        path: 'info',
                        Component: UserOrChatInfoDialog,
                        loader: ChatInfoDialogDataLoader,
                    },
                ],
            },
        ],
    }])

    return <RouterProvider router={router} />
}
