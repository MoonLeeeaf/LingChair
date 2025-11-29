import { Dropdown, Dialog, dialog } from "mdui"
import { $ } from "mdui/jq"
import Client from "../../api/Client.ts"
import Data_Message from "../../api/client_data/Message.ts"
import DataCaches from "../../api/DataCaches.ts"
import Avatar from "../Avatar.tsx"
import copyToClipboard from "../copyToClipboard.ts"
import useAsyncEffect from "../useAsyncEffect.ts"
import useEventListener from "../useEventListener.ts"
import React from "react"
import isMobileUI from "../isMobileUI.ts"
import User from "../../api/client_data/User.ts"
import getUrlForFileByHash from "../../getUrlForFileByHash.ts"
import escapeHTML from "../../escapeHtml.ts"

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
    ]
    function checkContinuousElement(tagName: string) {
        /* console.log('shangyige ', lastElementType)
         console.log("dangqian", tagName)
         console.log("上一个元素的类型和当前不一致?", lastElementType != tagName)
         console.log("上一个元素的类型和这个元素的类型都属于文本类型", (textElementTags.indexOf(lastElementType) != -1 && textElementTags.indexOf(tagName) != -1)) */
        // 如果上一个元素的类型和当前不一致, 或者上一个元素的类型和这个元素的类型都属于文本类型 (亦或者到最后一步时) 执行
        if ((lastElementType != tagName || (textElementTags.indexOf(lastElementType) != -1 && textElementTags.indexOf(tagName) != -1)) || tagName == 'LAST_CHICKEN') {
            /* console.log(tagName, '进入') */
            // 如果上一个元素类型为文本类型, 且当前不是文本类型时, 用文本包裹
            if (textElementTags.indexOf(lastElementType) != -1) {
                // 当前的文本类型不应该和上一个分离, 滚出去
                if (textElementTags.indexOf(tagName) != -1) return
                /* console.log(tagName, '文字和被') */
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
        /* console.log("当前", e, "内容", e.innerHTML) */
        checkContinuousElement(e.nodeName.toLowerCase())
        ls.push(e)
        lastElementType = e.nodeName.toLowerCase()
    }
    // 最后将剩余的转换
    checkContinuousElement('LAST_CHICKEN')
    return ret
}

interface Args extends React.HTMLAttributes<HTMLElement> {
    userId: string
    noUserDisplay?: boolean
    rawData: string
    renderHTML: string
    message: Data_Message
    openUserInfoDialog: (user: User | string) => void
}

export default function Message({ userId, rawData, renderHTML, message, openUserInfoDialog, noUserDisplay, ...props }: Args) {
    const isAtRight = Client.myUserProfile?.id == userId

    const [nickName, setNickName] = React.useState("")
    const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>("")

    useAsyncEffect(async () => {
        const user = await DataCaches.getUserProfile(userId)
        setNickName(user.nickname)
        setAvatarUrl(getUrlForFileByHash(user?.avatar_file_hash))
    }, [userId])

    const dropDownRef = React.useRef<Dropdown>(null)
    useEventListener(dropDownRef, 'closed', () => {
        setDropDownOpen(false)
    })

    const [isDropDownOpen, setDropDownOpen] = React.useState(false)

    /* const [isUsingFullDisplay, setIsUsingFullDisplay] = React.useState(false) */

    /* React.useEffect(() => {
        const text = $(dropDownRef.current as HTMLElement).find('#msg').text().trim()
        setIsUsingFullDisplay(text == '' || (
            rawData.split("tws:\/\/file\?hash=").length == 2
            && /\<\/chat\-(file|image|video)\>(\<\/span\>)?$/.test(renderHTML.trim())
        ))
    }, [renderHTML]) */

    return (
        <div
            slot="trigger"
            onContextMenu={(e) => {
                if (isMobileUI()) return
                e.preventDefault()
                setDropDownOpen(!isDropDownOpen)
            }}
            onClick={(e) => {
                if (!isMobileUI()) return
                e.preventDefault()
                setDropDownOpen(!isDropDownOpen)
            }}
            style={{
                width: "100%",
                display: "flex",
                justifyContent: isAtRight ? "flex-end" : "flex-start",
                flexDirection: "column"
            }}
            {...props}>
            <div
                style={{
                    display: noUserDisplay ? 'none' : "flex",
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
                <Avatar
                    src={avatarUrl}
                    text={nickName}
                    style={{
                        width: "43px",
                        height: "43px",
                        margin: "11px"
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        openUserInfoDialog(userId)
                    }} />
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
                <mdui-dropdown trigger="manual" ref={dropDownRef} open={isDropDownOpen}>
                    <span
                        slot="trigger"
                        id="msg"
                        style={{
                            fontSize: "94%",
                            wordBreak: 'break-word',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        dangerouslySetInnerHTML={{
                            __html: prettyFlatParsedMessage(renderHTML)
                        }} />
                    <mdui-menu onClick={(e) => {
                        e.stopPropagation()
                        setDropDownOpen(false)
                    }}>
                        <mdui-menu-item icon="content_copy" onClick={() => copyToClipboard($(dropDownRef.current as HTMLElement).find('#msg').text().trim())}>复制文字</mdui-menu-item>
                        <mdui-menu-item icon="content_copy" onClick={() => copyToClipboard(rawData)}>复制原文</mdui-menu-item>
                        <mdui-menu-item icon="info" onClick={() => dialog({
                            headline: "原始数据",
                            body: `<span style="word-break: break-word;">${Object.keys(message)
                                // @ts-ignore 懒
                                .map((k) => `${k} = ${message[k]}`)
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
                        }).addEventListener('click', (e) => e.stopPropagation())}>原始数据</mdui-menu-item>
                    </mdui-menu>
                </mdui-dropdown>
            </mdui-card>

        </div>
    )
}
