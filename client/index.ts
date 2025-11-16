import 'mdui/mdui.css'
import 'mdui'
import { $ } from "mdui/jq"
import { breakpoint, Dialog } from "mdui"

import * as React from 'react'
import ReactDOM from 'react-dom/client'

import './ui/custom-elements/chat-image.ts'
import './ui/custom-elements/chat-video.ts'
import './ui/custom-elements/chat-file.ts'
import './ui/custom-elements/chat-text.ts'
import './ui/custom-elements/chat-text-container.ts'

import App from './ui/App.tsx'
import AppMobile from './ui/AppMobile.tsx'
import isMobileUI from "./ui/isMobileUI.ts"
ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(React.createElement(isMobileUI() ? AppMobile : App, null))

import User from "./api/client_data/User.ts"
import Chat from "./api/client_data/Chat.ts"
// TODO: 无奈之举 以后会找更好的办法
declare global {
    interface Window {
        openUserInfoDialog: (user: User | string) => Promise<void>
        openChatInfoDialog: (chat: Chat) => void
    }
}

const onResize = () => {
    document.body.style.setProperty('--whitesilk-widget-message-maxwidth', breakpoint().down('md') ? "80%" : "70%")
    // deno-lint-ignore no-window
    document.body.style.setProperty('--whitesilk-window-width', window.innerWidth + 'px')
    // deno-lint-ignore no-window
    document.body.style.setProperty('--whitesilk-window-height', window.innerHeight + 'px')
}
// deno-lint-ignore no-window no-window-prefix
window.addEventListener('resize', onResize)
onResize()

// @ts-ignore 工作正常, 这里是获取为 URL 以便于构建
import sw from './sw.ts?worker&url'

if ("serviceWorker" in navigator)
    try {
        navigator.serviceWorker
            .register(sw as URL)
    } catch (e) {
        console.error(e)
    }
