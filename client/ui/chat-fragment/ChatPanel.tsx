import { Chat, Message } from "lingchair-client-protocol"
import ChatMessageContainer from "./ChatMessageContainer.tsx"
import useAsyncEffect from "../../utils/useAsyncEffect.ts"
import * as React from 'react'
import getClient from "../../getClient.ts"

function ChatPanelInner({ chat }: { chat: Chat }, ref: React.ForwardedRef<any>) {
    const containerRef = React.useRef<any>()

    React.useEffect(() => {
        const client = getClient()

        function cb({ message }: { message: Message }) {
            if (message.getChatId() == chat.getId()) {
                setMessages([message, ...messages])

                console.log(containerRef.current!.scrollHeight - containerRef.current!.scrollTop - containerRef.current!.clientHeight)
            }
        }

        client.on("Client.onMessage", cb)
        return () => {
            client.off("Client.onMessage", cb)
        }
    }, [chat])

    const [messages, setMessages] = React.useState<Message[]>([])
    const [offset, setOffset] = React.useState(0)

    React.useImperativeHandle(ref, () => {
        return {
            setOffset: (offset: number) => setOffset(offset),
            getOffset: () => offset,
        }
    }, [chat])

    useAsyncEffect(async () => {
        const messages = await chat.getMessagesOrThrow({ offset })
        setMessages(messages)
    }, [chat, offset])

    return <ChatMessageContainer useRef={containerRef} messages={messages} />
}

const ChatPanel = React.forwardRef(ChatPanelInner)

export type ChatPanelRef = {
    setOffset: (offset: number) => void
    getOffset: () => number
}

export default ChatPanel
