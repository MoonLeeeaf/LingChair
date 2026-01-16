import { Chat } from "lingchair-client-protocol"
import getClient from "../../getClient"
import ChatFragment from "./ChatFragment"
import * as React from 'react'
import useAsyncEffect from "../../utils/useAsyncEffect"

export default function LazyChatFragment({ chatId, openedInDialog }: { chatId: string, openedInDialog: boolean }) {
    const [child, setChild] = React.useState<React.ReactNode>()
    const chatInfoPromise = React.useMemo(() => Chat.getByIdOrThrow(getClient(), chatId), [chatId])

    useAsyncEffect(async () => {
        setChild(<ChatFragment chatInfo={await chatInfoPromise} openedInDialog={openedInDialog} />)
    }, [chatId])

    return <React.Suspense fallback={null}>
        {child}
    </React.Suspense>
}
