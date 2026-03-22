import { Dialog } from "mdui"
import * as React from 'react'
import LazyChatFragment from "../chat-fragment/LazyChatFragment.tsx"
import useEventListener from "../../utils/useEventListener.ts"

export default function ChatFragmentDialog({ chatId, useRef }: { chatId: string, useRef: React.MutableRefObject<Dialog | null> }) {
    useEventListener(useRef, 'open', () => {
        const shadow = useRef.current!.shadowRoot as ShadowRoot
        const panel = shadow.querySelector(".panel") as HTMLElement
        panel.style.padding = '0'
        panel.style.color = 'inherit'
        panel.style.backgroundColor = 'rgb(var(--mdui-color-background))'
        panel.style.setProperty('--mdui-color-background', 'inherit')
        const body = shadow.querySelector(".body") as HTMLElement
        body.style.height = '100%'
        body.style.display = 'flex'
    })

    return <mdui-dialog fullscreen ref={useRef}>
        <div style={{
            display: 'flex',
            width: '100%',
        }}>
            {chatId != null && chatId != '' && <LazyChatFragment chatId={chatId} openedInDialog={true} />}
        </div>
    </mdui-dialog>
}
