import { Dialog, dialog } from "mdui"
import { CallbackError, Chat } from "lingchair-client-protocol"
import showSnackbar from "../../utils/showSnackbar.ts"
import Avatar from "../Avatar.tsx"
import { useContextSelector } from "use-context-selector"
import MainSharedContext, { Shared } from "../MainSharedContext.ts"
import * as React from 'react'
import ClientCache from "../../ClientCache.ts"
import getClient from "../../getClient.ts"
import isMobileUI from "../../utils/isMobileUI.ts"
import useAsyncEffect from "../../utils/useAsyncEffect.ts"
import AppStateContext from "./AppStateContext.ts"

export default function UserOrChatInfoDialog({ chat, useRef }: { chat?: Chat, useRef: React.MutableRefObject<Dialog | undefined> }) {
    const favouriteChats = useContextSelector(
        MainSharedContext,
        (context: Shared) => context.state.favouriteChats
    )
    
    const AppState = React.useContext(AppStateContext)

    const [isMySelf, setIsMySelf] = React.useState(false)
    const [id, setId] = React.useState('')
    useAsyncEffect(async () => {
        setIsMySelf(await ClientCache.getMySelf().then((re) => {
            const id = re?.getId()!
            setId(id)
            return Chat.getOrCreatePrivateChat(getClient(), id)
        }).then((re) => re?.getId()) == chat?.getId())
    }, [chat])

    const favourited = React.useMemo(() => favouriteChats.map((v) => v.getId()).indexOf(chat?.getId() || '') != -1, [chat, favouriteChats])

    return (
        <mdui-dialog ref={useRef}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
            }}>
                <Avatar src={getClient().getUrlForFileByHash(chat?.getAvatarFileHash())} text={chat?.getTitle()} style={{
                    width: '50px',
                    height: '50px',
                }} />
                <div style={{
                    display: 'flex',
                    marginLeft: '15px',
                    marginRight: '15px',
                    fontSize: '16.5px',
                    flexDirection: 'column',
                    wordBreak: 'break-word',
                }}>
                    <span style={{
                        fontSize: '16.5px'
                    }}>{chat?.getTitle() + (isMySelf ? ' (我)' : '')}</span>
                    <span style={{
                        fontSize: '10.5px',
                        marginTop: '3px',
                        color: 'rgb(var(--mdui-color-secondary))',
                    }}>({chat?.getType()}) ID: {chat?.getType() == 'private' ? id : chat?.getId()}</span>
                </div>
            </div>
            <mdui-divider style={{
                marginTop: "10px",
            }}></mdui-divider>
            <mdui-list>
                {
                    isMySelf && <mdui-list-item icon="edit" rounded onClick={() => AppState.openEditMyProfile()}>
                        编辑资料
                    </mdui-list-item>
                }
                {
                    !isMySelf && <mdui-list-item icon={favourited ? "favorite_border" : "favorite"} rounded onClick={() => dialog({
                        headline: favourited ? "取消收藏对话" : "收藏对话",
                        description: favourited ? "确定从收藏对话列表中移除吗? (虽然这不会导致聊天记录丢失)" : "确定要添加到收藏对话列表吗?",
                        closeOnEsc: true,
                        closeOnOverlayClick: true,
                        actions: [
                            {
                                text: "取消",
                                onClick: () => {
                                    return true
                                },
                            },
                            {
                                text: "确定",
                                onClick: () => {
                                    ; (async () => {
                                        try {
                                            if (favourited)
                                                await (await ClientCache.getMySelf())!.removeFavouriteChatsOrThrow([chat?.getId()!])
                                            else
                                                await (await ClientCache.getMySelf())!.addFavouriteChatsOrThrow([chat?.getId()!])
                                        } catch (e) {
                                            if (e instanceof CallbackError)
                                                showSnackbar({
                                                    message: (favourited ? "取消收藏对话" : "收藏对话") + '失败: ' + e.message
                                                })
                                        }
                                    })()
                                    return true
                                },
                            }
                        ],
                    })}>{favourited ? '取消收藏' : '收藏对话'}</mdui-list-item>
                }
                <mdui-list-item icon="chat" rounded onClick={async () => {
                    AppState.openChat(chat!, isMobileUI())
                }}>打开对话</mdui-list-item>
            </mdui-list>
        </mdui-dialog>
    )
}
