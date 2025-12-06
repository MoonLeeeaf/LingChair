import isMobileUI from "../utils/isMobileUI.ts"
import useEventListener from "../utils/useEventListener.ts"
import AvatarMySelf from "./AvatarMySelf.tsx"
import MainSharedContext from './MainSharedContext.ts'
import * as React from 'react'
import { BrowserRouter, Outlet, Route, Routes } from "react-router"
import LoginDialog from "./main-page/LoginDialog.tsx"
import useAsyncEffect from "../utils/useAsyncEffect.ts"
import performAuth from "../performAuth.ts"
import { CallbackError } from "lingchair-client-protocol"
import showCircleProgressDialog from "./showCircleProgressDialog.ts"
import RegisterDialog from "./main-page/RegisterDialog.tsx"
import sleep from "../utils/sleep.ts"

export default function Main() {
    // 多页面切换
    const navigationRef = React.useRef<HTMLElement>()
    const [currentShowPage, setCurrentShowPage] = React.useState('Recents')
    type HTMLElementWithValue = HTMLElement & { value: string }
    useEventListener(navigationRef, 'change', (event) => {
        setCurrentShowPage((event.target as HTMLElementWithValue).value)
    })

    const [showLoginDialog, setShowLoginDialog] = React.useState(false)
    const [showRegisterDialog, setShowRegisterDialog] = React.useState(false)

    const sharedContext = {
        ui_functions: React.useRef({

        }),
        setShowLoginDialog,
        setShowRegisterDialog,
    }

    useAsyncEffect(async () => {
        const waitingForAuth = showCircleProgressDialog("验证中...")
        try {
            await performAuth({})
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
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={(
                        <div style={{
                            display: "flex",
                            position: 'relative',
                            width: 'calc(var(--whitesilk-window-width) - 80px)',
                            height: 'var(--whitesilk-window-height)',
                        }}>
                            {
                                // 将子路由渲染到此处
                                <Outlet />
                            }
                            <LoginDialog open={showLoginDialog} />
                            <RegisterDialog open={showRegisterDialog} />
                            {
                                /**
                                 * Default: 侧边列表提供列表切换
                                 */
                                !isMobileUI() ?
                                    <mdui-navigation-rail ref={navigationRef} contained value="Recents">
                                        <mdui-button-icon slot="top">
                                            <AvatarMySelf />
                                        </mdui-button-icon>

                                        <mdui-navigation-rail-item icon="watch_later--outlined" active-icon="watch_later--filled" value="Recents"></mdui-navigation-rail-item>
                                        <mdui-navigation-rail-item icon="favorite_border" active-icon="favorite" value="Contacts"></mdui-navigation-rail-item>
                                        <mdui-navigation-rail-item icon="chat--outlined" active-icon="chat--filled" value="AllChats"></mdui-navigation-rail-item>


                                        <mdui-dropdown trigger="hover" slot="bottom">
                                            <mdui-button-icon icon="add" slot="trigger"></mdui-button-icon>
                                            <mdui-menu>
                                                <mdui-menu-item icon="person_add">添加收藏对话</mdui-menu-item>
                                                <mdui-menu-item icon="group_add">创建群组</mdui-menu-item>
                                            </mdui-menu>
                                        </mdui-dropdown>
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
                                        <mdui-top-app-bar-title>{
                                            ({
                                                Recents: "最近对话",
                                                Contacts: "收藏对话",
                                                AllChats: "所有对话",
                                            })['Recents']
                                        }</mdui-top-app-bar-title>
                                        <div style={{
                                            flexGrow: 1,
                                        }}></div>
                                        <mdui-dropdown trigger="hover">
                                            <mdui-button-icon icon="add" slot="trigger"></mdui-button-icon>
                                            <mdui-menu>
                                                <mdui-menu-item icon="person_add">添加收藏对话</mdui-menu-item>
                                                <mdui-menu-item icon="group_add">创建群组</mdui-menu-item>
                                            </mdui-menu>
                                        </mdui-dropdown>
                                        <mdui-button-icon icon="settings"></mdui-button-icon>
                                        <mdui-button-icon>
                                            <AvatarMySelf />
                                        </mdui-button-icon>
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
                                    <mdui-navigation-bar-item icon="favorite_border" active-icon="favorite" value="Contacts">收藏对话</mdui-navigation-bar-item>
                                    <mdui-navigation-bar-item icon="chat--outlined" active-icon="chat--filled" value="AllChats">全部对话</mdui-navigation-bar-item>
                                </mdui-navigation-bar>
                            }
                        </div>
                    )}>
                    </Route>
                </Routes>
            </BrowserRouter>
        </MainSharedContext.Provider>
    )
}