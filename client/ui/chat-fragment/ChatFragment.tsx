import { $, Tab, TextField } from "mdui"
import useEventListener from "../../utils/useEventListener"
import useEffectRef from "../../utils/useEffectRef"
import isMobileUI from "../../utils/isMobileUI"
import { Chat } from "lingchair-client-protocol"
import Preference from "../preference/Preference"
import PreferenceHeader from "../preference/PreferenceHeader"
import PreferenceLayout from "../preference/PreferenceLayout"
import PreferenceUpdater from "../preference/PreferenceUpdater"
import SwitchPreference from "../preference/SwitchPreference"
import TextFieldPreference from "../preference/TextFieldPreference"
import * as React from 'react'
import ChatMessageContainer from "./ChatMessageContainer"
import AppStateContext from "../app-state/AppStateContext"

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
    const tabRef = React.useRef<Tab>()
    useEventListener(tabRef, 'change', () => {
        tabRef.current != null && setTabItemSelected(tabRef.current!.value as string)
    })

    const chatPanelRef = React.useRef<HTMLElement>()
    const inputRef = React.useRef<TextField>()

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
                <mdui-button-icon icon="open_in_new" onClick={() => {
                    window.open('/chat?id=' + chatInfo.getId(), '_blank')
                }} style={{
                    alignSelf: 'center',
                    marginLeft: '5px',
                    marginRight: '5px',
                }}></mdui-button-icon>
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
            }} onScroll={async (e: WheelEvent) => {
                const scrollTop = (e.target as HTMLDivElement).scrollTop
                if (scrollTop == 0) {
                    // 加载更多
                }
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: "center",
                    paddingTop: "15px",
                }}>
                    {/* 这里显示一些提示 */}
                </div>
                <ChatMessageContainer chatInfo={chatInfo} />
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
                    <mdui-text-field variant="outlined" placeholder="(｡･ω･｡)" autosize ref={inputRef} max-rows={6} onChange={() => {
                        if (inputRef.current?.value.trim() == '') {
                            // 清空缓存的文件
                        }
                    }} onKeyDown={(event: KeyboardEvent) => {
                        if (event.ctrlKey && event.key == 'Enter') {
                            // 发送消息
                        }
                    }} onPaste={(event: ClipboardEvent) => {
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
                    }}></mdui-text-field>
                    <mdui-button-icon slot="end-icon" icon="attach_file" style={{
                        marginRight: '6px',
                    }} onClick={() => {
                        // 添加文件
                    }}></mdui-button-icon>
                    <mdui-button-icon icon="send" style={{
                        marginRight: '7px',
                    }} onClick={() => {
                        // 发送消息
                    }}></mdui-button-icon>
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
                    /* chatInfo.getType() == 'group' && <PreferenceLayout>
                        <PreferenceUpdater.Provider value={groupPreferenceStore.createUpdater()}>
                            <PreferenceHeader
                                title="群组资料" />
                            <Preference
                                title="上传新的头像"
                                icon="image"
                                disabled={!chatInfo.isAdmin()}
                                onClick={() => {
                                    uploadChatAvatarRef.current!.click()
                                }} />
                            <TextFieldPreference
                                title="设置群名称"
                                icon="edit"
                                id="group_title"
                                state={groupPreferenceStore.state.group_title || ''}
                                disabled={!chatInfo.isAdmin()} />
                            <TextFieldPreference
                                title="设置群别名"
                                icon="edit"
                                id="group_name"
                                description="以便于添加, 可留空"
                                state={groupPreferenceStore.state.group_name || ''}
                                disabled={!chatInfo.isAdmin()} />
                            <PreferenceHeader
                                title="入群设定" />
                            <SwitchPreference
                                title="允许入群"
                                icon="person_add"
                                id="allow_new_member_join"
                                disabled={!chatInfo.isAdmin()}
                                state={groupPreferenceStore.state.allow_new_member_join || false} />
                            <SwitchPreference
                                title="允许成员邀请"
                                description="目前压根没有这项功能, 甚至还不能查看成员列表, 以后再说吧"
                                id="allow_new_member_from_invitation"
                                icon="_"
                                disabled={true || !chatInfo.isAdmin()}
                                state={groupPreferenceStore.state.allow_new_member_from_invitation || false} />
                            <SelectPreference
                                title="入群验证方式"
                                icon="_"
                                id="new_member_join_method"
                                selections={{
                                    disabled: "无需验证",
                                    allowed_by_admin: "只需要管理员批准 (WIP)",
                                    answered_and_allowed_by_admin: "需要回答问题并获得管理员批准 (WIP)",
                                }}
                                disabled={!chatInfo.isAdmin() || !groupPreferenceStore.state.allow_new_member_join}
                                state={groupPreferenceStore.state.new_member_join_method || 'disabled'} />
                            {
                                groupPreferenceStore.state.new_member_join_method == 'answered_and_allowed_by_admin'
                                && <TextFieldPreference
                                    title="设置问题"
                                    icon="_"
                                    id="answered_and_allowed_by_admin_question"
                                    description="WIP"
                                    state={groupPreferenceStore.state.answered_and_allowed_by_admin_question || ''}
                                    disabled={true || !chatInfo.isAdmin()} />
                            }
                        </PreferenceUpdater.Provider>
                    </PreferenceLayout> */
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
