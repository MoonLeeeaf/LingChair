import { Chat, Message } from 'lingchair-client-protocol'
import * as React from 'react'

export default function ChatMessageContainer({
    chat,
}: {
    chat: Chat
}) {
    const [messages, setMessages] = React.useState<Message[]>()

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: '20px',
            paddingTop: "15px",
            flexGrow: '1',
        }}>
            {messages?.map((v) => v.getText())}
        </div>
    )
}
