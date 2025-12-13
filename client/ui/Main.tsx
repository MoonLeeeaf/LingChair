import isMobileUI from "../utils/isMobileUI.ts"
import useEventListener from "../utils/useEventListener.ts"
import AvatarMySelf from "./AvatarMySelf.tsx"
import MainSharedContext from './MainSharedContext.ts'
import * as React from 'react'
import { BrowserRouter, createBrowserRouter, Link, LoaderFunction, Outlet, Route, RouterProvider, Routes } from "react-router"
import LoginDialog from "./main-page/LoginDialog.tsx"
import useAsyncEffect from "../utils/useAsyncEffect.ts"
import performAuth from "../performAuth.ts"
import { CallbackError, Chat, User, UserMySelf } from "lingchair-client-protocol"
import showCircleProgressDialog from "./showCircleProgressDialog.ts"
import RegisterDialog from "./main-page/RegisterDialog.tsx"
import sleep from "../utils/sleep.ts"
import { $, Dialog, NavigationDrawer } from "mdui"
import getClient from "../getClient.ts"
import showSnackbar from "../utils/showSnackbar.ts"
import AllChatsList from "./main-page/AllChatsList.tsx"
import FavouriteChatsList from "./main-page/FavouriteChatsList.tsx"
import AddFavourtieChatDialog from "./main-page/AddFavourtieChatDialog.tsx"
import RecentChatsList from "./main-page/RecentChatsList.tsx"
import UserOrChatInfoDialog from "./routers/UserOrChatInfoDialog.tsx"
import UserOrChatInfoDialogLoader from "./routers/UserOrChatInfoDialogDataLoader.ts"
import ChatFragmentDialog from "./routers/ChatFragmentDialog.tsx"
import EffectOnly from "./EffectOnly.tsx"
import MainSharedReducer from "./MainSharedReducer.ts"

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
    const [showAddFavourtieChatDialog, setShowAddFavourtieChatDialog] = React.useState(false)

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
        setShowAddFavourtieChatDialog,

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

    return (
        <MainSharedContext.Provider value={sharedContext}>
            <div style={{
                display: "flex",
                position: 'relative',
                flexDirection: isMobileUI() ? 'column' : 'row',
                width: `calc(var(--whitesilk-window-width))${isMobileUI() ? '' : ' - 80px'}`,
                height: 'var(--whitesilk-window-height)',
            }}>
                {
                    // 将子路由渲染到此处
                    <Outlet />
                }
                <LoginDialog open={showLoginDialog} />
                <RegisterDialog open={showRegisterDialog} />
                <AddFavourtieChatDialog open={showAddFavourtieChatDialog} />
                <mdui-navigation-drawer ref={drawerRef} modal close-on-esc close-on-overlay-click>
                    <mdui-list style={{
                        padding: '10px',
                    }}>
                        <mdui-list-item rounded>
                            <span>{myProfileCache?.getNickName()}</span>
                            <AvatarMySelf slot="icon" />
                        </mdui-list-item>
                        <mdui-list-item rounded icon="manage_accounts">账号设置</mdui-list-item>
                        <mdui-divider style={{
                            margin: '10px',
                        }}></mdui-divider>
                        <mdui-list-item rounded icon="person_add">添加收藏对话</mdui-list-item>
                        <mdui-list-item rounded icon="group_add">创建新的群组</mdui-list-item>
                        <Link to="/info/user?id=0960bd15-4527-4000-97a8-73110160296f"><mdui-list-item rounded icon="group_add">我是测试</mdui-list-item></Link>
                        <Link to="/info/chat?id=priv_0960bd15_4527_4000_97a8_73110160296f__0960bd15_4527_4000_97a8_73110160296f"><mdui-list-item rounded icon="group_add">我是测试2</mdui-list-item></Link>
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
                        display: 'flex',
                        height: 'calc(100% - 80px - 67px)',
                        width: '100%',
                    } : {}} id="SideBar">
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
    )
}

export default function Main() {
    const router = createBrowserRouter([{
        path: "/",
        Component: Root,
        hydrateFallbackElement: <EffectOnly effect={() => {
            const wait = showCircleProgressDialog("请稍后...")
            return () => {
                wait.open = false
            }
        }} deps={[]} />,
        children: [
            {
                path: 'info/:type',
                Component: UserOrChatInfoDialog,
                loader: UserOrChatInfoDialogLoader,
            },
            /* {
                path: 'chat',
                Component: ChatFragmentDialog,
                loader: UserOrChatInfoDialogLoader,
            }, */
        ],
    }])

    return <RouterProvider router={router} />
}
