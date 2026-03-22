import { Message } from 'lingchair-client-protocol'
import * as React from 'react'
import ChatMessage from './ChatMessage.tsx'
import { dialog } from 'mdui'

export default function ChatMessageContainer({ messages, useRef }: { messages: Message[], useRef: React.MutableRefObject<any>}) {
    console.log(messages)
    return (
        <div ref={useRef} style={{
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
                            <ChatMessage
                                message={msg}
                                noUserDisplay={lastUser == user && !shouldShowTime}
                                avatarMenuItems={[
                                    <mdui-menu-item icon="info" onClick={async () => {
                                        const user = await msg.getUser().then((re) => re?.bean) || {}
                                        dialog({
                                            headline: "Info",
                                            body: `<span style="word-break: break-word;">${Object.keys(user)
                                                // @ts-ignore 懒
                                                .map((k) => `${k} = ${user[k]}`)
                                                .join('<br><br>')}<span>`,
                                            closeOnEsc: true,
                                            closeOnOverlayClick: true,
                                            actions: [
                                                {
                                                    text: "关闭",
                                                    onClick: () => {
                                                        return true
                                                    },
                                                }
                                            ]
                                        }).addEventListener('click', (e) => e.stopPropagation())
                                    }}>JSON</mdui-menu-item>
                                ]}
                                messageMenuItems={[
                                    <mdui-menu-item icon="info" onClick={() => dialog({
                                        headline: "Info",
                                        body: `<span style="word-break: break-word;">${Object.keys(msg.bean)
                                            // @ts-ignore 懒
                                            .map((k) => `${k} = ${msg.bean[k]}`)
                                            .join('<br><br>')}<span>`,
                                        closeOnEsc: true,
                                        closeOnOverlayClick: true,
                                        actions: [
                                            {
                                                text: "关闭",
                                                onClick: () => {
                                                    return true
                                                },
                                            }
                                        ]
                                    }).addEventListener('click', (e) => e.stopPropagation())}>Info</mdui-menu-item>
                                ]}
                            />
                        </>
                    })
                })()
            }
        </div>
    )
}
