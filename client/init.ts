import 'mdui/mdui.css'
import 'mdui'
import { breakpoint } from "mdui"

import './env.d.ts'

import * as React from 'react'
import ReactDOM from 'react-dom/client'

import './ui/chat-elements/chat-image.ts'
import './ui/chat-elements/chat-video.ts'
import './ui/chat-elements/chat-file.ts'
import './ui/chat-elements/chat-text.ts'
import './ui/chat-elements/chat-mention.ts'
import './ui/chat-elements/chat-text-container.ts'
import './ui/chat-elements/chat-quote.ts'
import Main from "./ui/Main.tsx"

import performAuth from './performAuth.ts'

try {
    await performAuth({})
} catch (e) {
    console.log("验证失败", e)
}

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(React.createElement(Main))

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

const config = await fetch('/config.json').then((re) => re.json())
config.title && (document.title = config.title)
