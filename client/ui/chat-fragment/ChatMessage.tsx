import { ChatParserTransformers, Message } from "lingchair-client-protocol"
import isMobileUI from "../../utils/isMobileUI.ts"
import useAsyncEffect from "../../utils/useAsyncEffect.ts"
import ClientCache from "../../ClientCache.ts"
import getClient from "../../getClient.ts"
import Avatar from "../Avatar.tsx"
import AppStateContext from "../app-state/AppStateContext.ts"
import { Dropdown } from "mdui"
import useEventListener from "../../utils/useEventListener.ts"
import DOMPurify from 'dompurify'
import * as React from 'react'
import ChatMentionElement from "../chat-elements/chat-mention.ts"

function escapeHTML(str: string) {
    const div = document.createElement('div')
    div.textContent = str
    const re = div.innerHTML
    div.remove()
    return re
}

/**
 * 将扁平化的渲染文本重新排版
 * 
 * 旨在优化图片, 文件, 视频等消息元素的显示
 * 
 * @param html 
 * @returns { string }
 */
function prettyFlatParsedMessage(html: string) {
    const elements = new DOMParser().parseFromString(html, 'text/html').body.children
    // 纯文本直接处理
    if (elements.length == 0)
        return `<chat-text-container><chat-text>${escapeHTML(html)}</chat-text></chat-text-container>`
    let ls: Element[] = []
    let ret = ''
    // 第一个元素时, 不会被聚合在一起
    let lastElementType = ''
    const textElementTags = [
        'chat-text',
        'chat-mention',
        'chat-quote',
    ]
    function checkContinuousElement(tagName: string) {
        // 如果上一个元素的类型和当前不一致, 或者上一个元素的类型和这个元素的类型都属于文本类型 (亦或者到最后一步时) 执行
        if ((lastElementType != tagName || (textElementTags.indexOf(lastElementType) != -1 && textElementTags.indexOf(tagName) != -1)) || tagName == 'LAST_CHICKEN') {
            // 如果上一个元素类型为文本类型, 且当前不是文本类型时, 用文本块包裹
            if (textElementTags.indexOf(lastElementType) != -1) {
                // 当前的文本类型不应该和上一个分离, 滚出去
                if (textElementTags.indexOf(tagName) != -1) return
                // 由于 chat-mention 不是用内部元素实现的, 因此在这个元素的生成中必须放置占位字符串
                // 尽管显示上占位字符串不会显示, 但是在这里依然是会被处理的, 因为本身还是 innerHTML

                // 当文本非空时, 将文字合并在一起
                if (ls.map((v) => v.innerHTML).join('').trim() != '')
                    ret += `<chat-text-container>${ls.map((v) => v.outerHTML).join('')}</chat-text-container>`
            } else
                // 非文本类型元素, 各自成块
                ret += ls.map((v) => v.outerHTML).join('')
            ls = []
        }
    }
    for (const e of elements) {
        // 当出现非文本元素时, 将文本聚合在一起
        // 如果是其他类型, 虽然也执行聚合, 但是不会有外层包裹
        checkContinuousElement(e.nodeName.toLowerCase())
        ls.push(e)
        lastElementType = e.nodeName.toLowerCase()
    }
    // 最后将剩余的转换
    checkContinuousElement('LAST_CHICKEN')
    return ret
}

const sanitizeConfig = {
    ALLOWED_TAGS: [
        "chat-image",
        "chat-video",
        "chat-file",
        'chat-text',
        "chat-link",
        'chat-mention',
        'chat-quote',
    ],
    ALLOWED_ATTR: [
        'underline',
        'em',
        'src',
        'alt',
        'href',
        'name',
        'user-id',
        'chat-id',
    ],
}

const transformers: ChatParserTransformers = {
    attachment({ fileType, attachment }) {
        const url = getClient().getUrlForFileByHash(attachment.getFileHash())
        return ({
            Image: `<chat-image src="${url}" alt="${attachment.getFileName()}"></chat-image>`,
            Video: `<chat-video src="${url}"></chat-video>`,
            File: `<chat-file href="${url}" name="${attachment.getFileName()}"></chat-file>`,
        })?.[fileType]
    },
    mention({ mentionType, mention }) {
        switch (mentionType) {
            case "UserMention":
                return `<chat-mention user-id="${mention.user_id}" text="${mention.text}">[对话提及]</chat-mention>`
            case "ChatMention":
                return `<chat-mention chat-id="${mention.chat_id}" text="${mention.text}">[对话提及]</chat-mention>`
        }
    },
}

export default function ChatMessage({ message, noUserDisplay, avatarMenuItems, messageMenuItems }: { message: Message, noUserDisplay?: boolean, avatarMenuItems?: globalThis.React.JSX.IntrinsicElements['mdui-menu-item'][], messageMenuItems?: globalThis.React.JSX.IntrinsicElements['mdui-menu-item'][] }) {
    const AppState = React.useContext(AppStateContext)

    const [show, setShown] = React.useState(false)

    const [isAtRight, setAtRight] = React.useState(false)

    const messageDropDownRef = React.useRef<Dropdown>()
    const [isMessageDropDownOpen, setMessageDropDownOpen] = React.useState(false)
    useEventListener(messageDropDownRef, 'closed', () => {
        setMessageDropDownOpen(false)
    })

    const avatarDropDownRef = React.useRef<Dropdown>()
    const [isAvatarDropDownOpen, setAvatarDropDownOpen] = React.useState(false)
    useEventListener(avatarDropDownRef, 'closed', () => {
        setAvatarDropDownOpen(false)
    })

    const [nickName, setNickName] = React.useState(message.getUserId()! || 'System')
    const [avatarUrl, setAvatarUrl] = React.useState('')
    useAsyncEffect(async () => {
        const user = await ClientCache.getUser(message.getUserId()!)
        setAtRight(await ClientCache.getMySelf().then((re) => re?.getId()) == user?.getId())
        setNickName(user?.getNickName() || '')
        setAvatarUrl(getClient().getUrlForFileByHash(user?.getAvatarFileHash() || '') || '')
        setShown(true)
    }, [message])

    const messageInnerRef = React.useRef<HTMLSpanElement>(null)
    React.useEffect(() => {
        messageInnerRef.current!.innerHTML = prettyFlatParsedMessage(DOMPurify.sanitize(message.parseWithTransformers(transformers), sanitizeConfig))

        // 没有办法的办法 （笑）
        // 姐姐, 谁让您不是 React 组件呢
        messageInnerRef.current!.querySelectorAll('chat-mention').forEach((v) => {
            const e = v as ChatMentionElement
            e.openChatInfo = AppState.openChatInfo
            e.openUserInfo = AppState.openUserInfo
        })
    }, [message])

    return <>
        <div style={{
            display: show ? 'none' : undefined,
            padding: '5px',
        }}>加载中...</div>
        <div
            slot="trigger"
            onContextMenu={(e) => {
                if (isMobileUI()) return
                e.preventDefault()
                setMessageDropDownOpen(!isMessageDropDownOpen)
            }}
            onClick={(e) => {
                if (!isMobileUI()) return
                e.preventDefault()
                setMessageDropDownOpen(!isMessageDropDownOpen)
            }}
            style={{
                width: "100%",
                display: show ? 'flex' : 'none',
                justifyContent: isAtRight ? "flex-end" : "flex-start",
                flexDirection: "column"
            }}>
            {
                <div
                    style={{
                        display: noUserDisplay ? "none" : "flex",
                        justifyContent: isAtRight ? "flex-end" : "flex-start",
                    }}>
                    {
                        // 发送者昵称(左)
                        isAtRight && <span
                            style={{
                                alignSelf: "center",
                                fontSize: "90%"
                            }}>
                            {nickName}
                        </span>
                    }
                    {
                        // 发送者头像
                    }
                    <mdui-dropdown trigger="manual" ref={avatarDropDownRef} open={isAvatarDropDownOpen}>
                        <Avatar
                            slot="trigger"
                            src={avatarUrl}
                            text={nickName}
                            style={{
                                width: "43px",
                                height: "43px",
                                margin: "11px"
                            }}
                            onContextMenu={(e) => {
                                if (isMobileUI()) return
                                e.preventDefault()
                                e.stopPropagation()
                                setAvatarDropDownOpen(!isAvatarDropDownOpen)
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                                AppState.openUserInfo(message.getUserId()!)
                            }} />
                        <mdui-menu>
                            {avatarMenuItems}
                        </mdui-menu>
                    </mdui-dropdown>
                    {
                        // 发送者昵称(右)
                        !isAtRight && <span
                            style={{
                                alignSelf: "center",
                                fontSize: "90%"
                            }}>
                            {nickName}
                        </span>
                    }
                </div>
            }
            <mdui-card
                variant="elevated"
                style={{
                    maxWidth: 'var(--whitesilk-widget-message-maxwidth)', // (window.matchMedia('(pointer: fine)') && "50%") || (window.matchMedia('(pointer: coarse)') && "77%"),
                    minWidth: "0%",
                    [isAtRight ? "marginRight" : "marginLeft"]: "55px",
                    marginTop: noUserDisplay ? '5px' : "-5px",
                    alignSelf: isAtRight ? "flex-end" : "flex-start",
                    // boxShadow: isUsingFullDisplay ? 'inherit' : 'var(--mdui-elevation-level1)',
                    // padding: isUsingFullDisplay ?  undefined : "13px",
                    // paddingTop: isUsingFullDisplay ?  undefined : "14px",
                    // backgroundColor: isUsingFullDisplay ? "inherit" : undefined
                }}>
                <mdui-dropdown trigger="manual" ref={messageDropDownRef} open={isMessageDropDownOpen}>
                    <span
                        slot="trigger"
                        id="msg"
                        style={{
                            fontSize: "94%",
                            wordBreak: 'break-word',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        ref={messageInnerRef} />
                    <mdui-menu onClick={(e: MouseEvent) => {
                        e.stopPropagation()
                        setMessageDropDownOpen(false)
                    }}>
                        {messageMenuItems}
                    </mdui-menu>
                </mdui-dropdown>
            </mdui-card>

        </div>
    </>
}
