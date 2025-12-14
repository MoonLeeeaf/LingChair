import { useSearchParams } from "react-router"
import useRouterDialogRef from "./useRouterDialogRef"
import * as React from 'react'
import LazyChatFragment from "../chat-fragment/LazyChatFragment"

export default function ChatFragmentDialog() {
    const [searchParams] = useSearchParams()
    const id = searchParams.get('id')

    const dialogRef = useRouterDialogRef()

    React.useEffect(() => {
        const shadow = dialogRef.current!.shadowRoot as ShadowRoot
        const panel = shadow.querySelector(".panel") as HTMLElement
        panel.style.padding = '0'
        panel.style.color = 'inherit'
        panel.style.backgroundColor = 'rgb(var(--mdui-color-background))'
        panel.style.setProperty('--mdui-color-background', 'inherit')
        const body = shadow.querySelector(".body") as HTMLElement
        body.style.height = '100%'
        body.style.display = 'flex'
    }, [])

    return <mdui-dialog fullscreen ref={dialogRef}>
        <LazyChatFragment chatId={id!} openedWithRouter={true} />
    </mdui-dialog>
}
