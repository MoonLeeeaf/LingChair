import { $, Tab, TextField } from "mdui"
import useEventListener from "../../utils/useEventListener.ts"
import useEffectRef from "../../utils/useEffectRef.ts"
import isMobileUI from "../../utils/isMobileUI.ts"
import { Chat, Message, UserMySelf } from "lingchair-client-protocol"
import Preference from "../preference/Preference.tsx"
import PreferenceHeader from "../preference/PreferenceHeader.tsx"
import PreferenceLayout from "../preference/PreferenceLayout.tsx"
import PreferenceUpdater from "../preference/PreferenceUpdater.tsx"
import SwitchPreference from "../preference/SwitchPreference.tsx"
import TextFieldPreference from "../preference/TextFieldPreference.tsx"
import * as React from 'react'
import ChatMessageContainer from "./ChatMessageContainer"
import AppStateContext from "../app-state/AppStateContext.ts"
import ChatPanel, { ChatPanelRef } from "./ChatPanel.tsx"
import getClient from "../../getClient.ts"

interface MduiTabFitSizeArgs extends React.HTMLAttributes<HTMLElement & Tab> {
    value: string
}
function MduiTabFitSize({ children, ...props }: MduiTabFitSizeArgs) {
    return <mdui-tab {...props} style={{
        ...props?.style,
        minWidth: 'fit-content',
    }}>
        {children}
    </mdui-tab>
}

export default function ChatFragment({
    chatInfo,
    openedInDialog,
}: {
    chatInfo: Chat
    openedInDialog: boolean
}) {
    const AppState = React.useContext(AppStateContext)
    const [tabItemSelected, setTabItemSelected] = React.useState('Chat')
    const tabRef = React.useRef<Tab>(null)
    useEventListener(tabRef, 'change', () => {
        tabRef.current != null && setTabItemSelected(tabRef.current!.value as string)
    })

    const chatPanelRef = React.useRef<HTMLElement>(null)
    const inputRef = React.useRef<TextField>(null)
    const chatPagePanelRef = React.useRef<ChatPanelRef>(null)

    const [sendingMessages, setSendingMessages] = React.useState<Message[]>([])
    /**
     * 发送消息, 成功则清空文本
     */
    async function performSendMessage() {
        const text = inputRef.current!.value
        inputRef.current!.value = ''
        const msg = new Message(getClient(), {
            id: -1,
            text,
            time: Date.now(),
            user_id: await UserMySelf.getMySelf(getClient()).then((re) => re?.getId())
        })
        setSendingMessages([msg, ...sendingMessages])
        await chatInfo.sendMessageOrThrow(text)
        setSendingMessages([])
    }
    /**
     * 拉取更多消息
     * 本质是修改获取的偏移?
     * WIP
     */
    async function pullMoreMessages() {

    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
        }}>
            <mdui-tabs ref={useEffectRef<HTMLElement>((ref) => {
                $(ref.current!.shadowRoot).append(`<style>.container::after { height: 0 !important; }</style>`)
                $(tabRef.current!.shadowRoot).append(`<style>.container::after { height: 0 !important; }</style>`)
                    ; (!isMobileUI()) && $(tabRef.current!.shadowRoot).append(`<style>.no-scroll-bar::-webkit-scrollbar{width:0px !important}*::-webkit-scrollbar{width:7px;height:10px}*::-webkit-scrollbar-track{width:6px;background:rgba(#101f1c,0.1);-webkit-border-radius:2em;-moz-border-radius:2em;border-radius:2em}*::-webkit-scrollbar-thumb{background-color:rgba(144,147,153,0.5);background-clip:padding-box;min-height:28px;-webkit-border-radius:2em;-moz-border-radius:2em;border-radius:2em;transition:background-color 0.3s;cursor:pointer}*::-webkit-scrollbar-thumb:hover{background-color:rgba(144,147,153,0.3)}</style>`)
            }, [])} style={{
                position: 'sticky',
                display: "flex",
                flexDirection: "column",
            }}>
                {
                    openedInDialog && <mdui-button-icon icon="arrow_back" onClick={() => AppState.closeChat()} style={{
                        alignSelf: 'center',
                        marginLeft: '5px',
                        marginRight: '5px',
                    }}></mdui-button-icon>
                }
                <mdui-tabs ref={tabRef} value={tabItemSelected} style={{
                    position: 'sticky',
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    width: '100%',
                    overflowX: 'auto',
                }}>
                    {
                        chatInfo.isMember() ? <>
                            <MduiTabFitSize value="Chat">{chatInfo.getTitle()}</MduiTabFitSize>
                            {chatInfo.getType() == 'group' && chatInfo.isAdmin() && <MduiTabFitSize value="NewMemberRequests">加入请求</MduiTabFitSize>}
                            {chatInfo.getType() == 'group' && <MduiTabFitSize value="GroupMembers">群组成员</MduiTabFitSize>}
                        </>
                            : <MduiTabFitSize value="RequestJoin">{chatInfo.getTitle()}</MduiTabFitSize>
                    }
                    {chatInfo.getType() == 'group' && <MduiTabFitSize value="Settings">设置</MduiTabFitSize>}
                </mdui-tabs>
                <div style={{
                    flexGrow: '1',
                }}></div>
                {
                    /*
                    <mdui-button-icon icon="open_in_new" onClick={() => {
                        window.open('/chat?id=' + chatInfo.getId(), '_blank')
                    }} style={{
                        alignSelf: 'center',
                        marginLeft: '5px',
                        marginRight: '5px',
                    }}></mdui-button-icon>
                    */
                }
                <mdui-button-icon icon="refresh" onClick={() => {

                }} style={{
                    alignSelf: 'center',
                    marginLeft: '5px',
                    marginRight: '5px',
                }}></mdui-button-icon>
                <mdui-button-icon icon="info" onClick={() => AppState.openChatInfo(chatInfo.getId())} style={{
                    alignSelf: 'center',
                    marginLeft: '5px',
                    marginRight: '5px',
                }}></mdui-button-icon>
            </mdui-tabs>
            <mdui-tab-panel slot="panel" value="RequestJoin" style={{
                display: tabItemSelected == "RequestJoin" ? "flex" : "none",
                flexDirection: "column",
                height: "100%",
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <div>
                    {/* 非群成员 */}
                </div>
            </mdui-tab-panel>
            <mdui-tab-panel slot="panel" value="Chat" ref={chatPanelRef} style={{
                display: tabItemSelected == "Chat" ? "flex" : "none",
                flexDirection: "column",
                height: "100%",
            }} onScroll={async (e) => {
                const scrollTop = (e.target as HTMLDivElement).scrollTop
                if (scrollTop == 0) {
                    // 加载更多
                    chatPagePanelRef.current?.setOffset(chatPagePanelRef.current.getOffset() + 15)
                }
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: "center",
                    paddingTop: "15px",
                }}>
                    {/* 这里显示一些提示 */}
                </div>
                <ChatPanel ref={chatPagePanelRef} chat={chatInfo} />
                {
                    // 输入框
                }
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingBottom: '2px',
                    paddingTop: '0.1rem',
                    position: 'sticky',
                    bottom: '0',
                    paddingLeft: '5px',
                    paddingRight: '4px',
                    backgroundColor: 'rgb(var(--mdui-color-surface))',
                }} onDrop={(e) => {
                    // 文件拽入
                }}>
                    <mdui-text-field variant="outlined" use-patched-textarea placeholder="(｡･ω･｡)" autosize ref={inputRef} max-rows={6} onChange={() => {
                        if (inputRef.current?.value.trim() == '') {
                            // 清空缓存的文件
                        }
                    }} onKeyDown={(event) => {
                        if (event.ctrlKey && event.key == 'Enter') {
                            // 发送消息
                            performSendMessage()
                        }
                    }} onPaste={(event) => {
                        for (const item of event.clipboardData?.items || []) {
                            if (item.kind == 'file') {
                                event.preventDefault()
                                const file = item.getAsFile() as File
                                // 添加文件
                            }
                        }
                    }} style={{
                        marginRight: '10px',
                        marginTop: '3px',
                        marginBottom: '3px',
                    }}>
                    </mdui-text-field>
                    <mdui-button-icon slot="end-icon" icon="attach_file" style={{
                        marginRight: '6px',
                    }} onClick={() => {
                        // 添加文件
                    }}></mdui-button-icon>
                    <mdui-button-icon icon="send" style={{
                        marginRight: '7px',
                    }} onClick={performSendMessage}></mdui-button-icon>
                    <div style={{
                        display: 'none'
                    }}>
                        <input accept="*/*" type="file" name="添加文件" multiple ></input>
                    </div>
                </div>
            </mdui-tab-panel>
            {
                chatInfo.getType() == 'group' && <mdui-tab-panel slot="panel" value="GroupMembers" style={{
                    display: tabItemSelected == "GroupMembers" ? "flex" : "none",
                    flexDirection: "column",
                    height: "100%",
                }}>
                    {/* <GroupMembersList chat={chatInfo} /> */}
                </mdui-tab-panel>
            }
            {
                chatInfo.getType() == 'group' && <mdui-tab-panel slot="panel" value="NewMemberRequests" style={{
                    display: tabItemSelected == "NewMemberRequests" ? "flex" : "none",
                    flexDirection: "column",
                    height: "100%",
                }}>
                    {/* {chatInfo.isAdmin() && <JoinRequestsList chat={chatInfo} />} */}
                </mdui-tab-panel>
            }
            <mdui-tab-panel slot="panel" value="Settings" style={{
                display: tabItemSelected == "Settings" ? "flex" : "none",
                flexDirection: "column",
                height: "100%",
            }}>
                <div style={{
                    display: 'none'
                }}>
                    <input accept="image/*" type="file" name="上传对话头像"></input>
                </div>
                {
                    // 群组设置?
                }
                {
                    chatInfo.getType() == 'private' && (
                        <div>
                            未制作
                        </div>
                    )
                }
            </mdui-tab-panel>
        </div>
    )
}
