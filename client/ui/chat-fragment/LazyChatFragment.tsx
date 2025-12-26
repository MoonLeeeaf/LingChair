import { Chat } from "lingchair-client-protocol"
import { Await } from "react-router"
import getClient from "../../getClient"
import ChatFragment from "./ChatFragment"
import * as React from 'react'
import EffectOnly from "../EffectOnly"

export default function LazyChatFragment({ chatId, openedWithRouter }: { chatId: string, openedWithRouter: boolean }) {
    return <React.Suspense fallback={<EffectOnly effect={() => {}} deps={[]} />}>
        <Await
            resolve={React.useMemo(() => Chat.getByIdOrThrow(getClient(), chatId), [chatId])}
            children={(chatInfo: Chat) => <ChatFragment chatInfo={chatInfo} openedWithRouter={openedWithRouter} />} />
    </React.Suspense>
}
