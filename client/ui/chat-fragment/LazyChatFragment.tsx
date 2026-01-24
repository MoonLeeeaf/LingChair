import { Chat } from "lingchair-client-protocol"
import getClient from "../../getClient.ts"
import ChatFragment from "./ChatFragment.tsx"
import * as React from 'react'
import useAsyncEffect from "../../utils/useAsyncEffect.ts"

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
