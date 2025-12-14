import { Chat } from "lingchair-client-protocol"
import { Await } from "react-router"
import getClient from "../../getClient"
import ChatFragment from "./ChatFragment"
import * as React from 'react'
import showSnackbar from "../../utils/showSnackbar"
import EffectOnly from "../EffectOnly"

export default function LazyChatFragment({ chatId, openedWithRouter }: { chatId: string, openedWithRouter: boolean }) {
    return <React.Suspense fallback={<EffectOnly effect={() => {
        const s = showSnackbar({
            message: '请稍后...',
            autoCloseDelay: 0,
        })
        return () => {
            s.open = false
        }
    }} deps={[]} />}>
        <Await
            resolve={React.useMemo(() => Chat.getByIdOrThrow(getClient(), chatId), [chatId])}
            children={(chatInfo: Chat) => <ChatFragment chatInfo={chatInfo} openedWithRouter={openedWithRouter} />} />
    </React.Suspense>
}
