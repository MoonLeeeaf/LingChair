import { Chat, Message } from 'lingchair-client-protocol'
import * as React from 'react'
import ChatMessage from './ChatMessage'

export default function ChatMessageContainer({ messages }: { messages: Message[] }) {
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
            {
                (() => {
                    // 添加时间
                    let date = new Date(0)
                    function timeAddZeroPrefix(t: number) {
                        if (t >= 0 && t < 10)
                            return '0' + t
                        return t + ''
                    }

                    // 合并同用户消息
                    let user: string | undefined
                    return messages?.map((msg) => {
                        // 添加时间
                        const lastDate = date
                        date = new Date(msg.getTime())
                        const shouldShowTime = msg.getUserId() != null &&
                            (date.getMinutes() != lastDate.getMinutes() || date.getDate() != lastDate.getDate() || date.getMonth() != lastDate.getMonth() || date.getFullYear() != lastDate.getFullYear())

                        // 合并同用户消息
                        const lastUser = user
                        user = msg.getUserId()

                        return <>
                            {
                                shouldShowTime && <mdui-tooltip content={`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日  ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`}>
                                    <div style={{
                                        fontSize: '87%',
                                        marginTop: '13px',
                                        marginBottom: '10px',
                                    }}>
                                        {
                                            (date.getFullYear() != lastDate.getFullYear() ? `${date.getFullYear()}年` : '')
                                            + `${date.getMonth() + 1}月`
                                            + `${date.getDate()}日`
                                            + `  ${timeAddZeroPrefix(date.getHours())}:${timeAddZeroPrefix(date.getMinutes())}`
                                        }
                                    </div>
                                </mdui-tooltip>
                            }
                            <ChatMessage message={msg} noUserDisplay={lastUser == user && !shouldShowTime} />
                        </>
                    })
                })()
            }
        </div>
    )
}
