import { dialog } from "mdui"
import useRouterDialogRef from "./useRouterDialogRef"
import { useLoaderData, useNavigate } from "react-router"
import { CallbackError } from "lingchair-client-protocol"
import showSnackbar from "../../utils/showSnackbar"
import Avatar from "../Avatar"
import { useContextSelector } from "use-context-selector"
import MainSharedContext, { Shared } from "../MainSharedContext"
import * as React from 'react'
import UserOrChatInfoDialogLoader from "./UserOrChatInfoDialogDataLoader"
import ClientCache from "../../ClientCache"
import getClient from "../../getClient"
import gotoChat from "./gotoChat"
import isMobileUI from "../../utils/isMobileUI"

export default function UserOrChatInfoDialog() {
    const favouriteChats = useContextSelector(
        MainSharedContext,
        (context: Shared) => context.state.favouriteChats
    )
    const setCurrentSelectedChatId = useContextSelector(
        MainSharedContext,
        (context: Shared) => context.setCurrentSelectedChatId
    )

    console.log(setCurrentSelectedChatId, favouriteChats)

    const nav = useNavigate()

    const dialogRef = useRouterDialogRef()
    const { chat, id, mySelf } = useLoaderData<typeof UserOrChatInfoDialogLoader>()

    const isMySelf = mySelf?.getId() == id

    const favourited = React.useMemo(() => favouriteChats.map((v) => v.getId()).indexOf(chat.getId() || '') != -1, [chat, favouriteChats])

    return (
        <mdui-dialog close-on-overlay-click close-on-esc ref={dialogRef}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
            }}>
                <Avatar src={getClient().getUrlForFileByHash(chat.getAvatarFileHash())} text={chat.getTitle()} style={{
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
                    }}>{chat.getTitle() + (isMySelf ? ' (我)' : '')}</span>
                    <span style={{
                        fontSize: '10.5px',
                        marginTop: '3px',
                        color: 'rgb(var(--mdui-color-secondary))',
                    }}>({chat.getType()}) ID: {chat.getType() == 'private' ? id : chat.getId()}</span>
                </div>
            </div>
            <mdui-divider style={{
                marginTop: "10px",
            }}></mdui-divider>
            <mdui-list>
                {
                    isMySelf && <mdui-list-item icon="edit" rounded onClick={() => nav('/settings/edit_profile')}>
                        编辑资料
                    </mdui-list-item>
                }
                {
                    !isMySelf && <mdui-list-item icon={favourited ? "favorite_border" : "favorite"} rounded onClick={() => dialog({
                        headline: favourited ? "取消收藏对话" : "收藏对话",
                        description: favourited ? "确定从收藏对话列表中移除吗? (虽然这不会导致聊天记录丢失)" : "确定要添加到收藏对话列表吗?",
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
                                                await (await ClientCache.getMySelf())!.removeFavouriteChatsOrThrow([chat.getId()])
                                            else
                                                await (await ClientCache.getMySelf())!.addFavouriteChatsOrThrow([chat.getId()])
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
                    await nav(-1)
                    gotoChat(isMobileUI() ? {
                        nav: nav,
                        id: chat.getId(),
                    } : {
                        setter: setCurrentSelectedChatId,
                        id: chat.getId(),
                    })
                }}>打开对话</mdui-list-item>
            </mdui-list>
        </mdui-dialog>
    )

    /* const location = useLocation()
    const searchParams = useSearchParams()
    const params = useParams()

    return (
        <mdui-dialog close-on-overlay-click close-on-esc ref={dialogRef}>
            <span style={{
                wordBreak: "break-word",
            }} dangerouslySetInnerHTML={{
                __html: "↓ searchParams<br><br>"
                    + Object.keys(location)
                        // @ts-ignore 懒
                        .map((k) => `${k} = ${location[k]}`)
                        .join('<br><br>')
                    + "<br><br>↓ searchParams<br><br>" + Object.keys(searchParams)
                        // @ts-ignore 懒
                        .map((k) => `${k} = ${searchParams[k]}`)
                        .join('<br><br>')
                    + "<br><br>↓ params<br><br>" + Object.keys(params)
                        // @ts-ignore 懒
                        .map((k) => `${k} = ${params[k]}`)
                        .join('<br><br>')
            }}></span>
        </mdui-dialog>
    ) */
}
