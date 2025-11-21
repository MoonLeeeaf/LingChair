import React from 'react'
import Chat from "../../api/client_data/Chat.ts"
import useAsyncEffect from "../useAsyncEffect.ts"
import Client from "../../api/Client.ts"
import data from "../../Data.ts"
import { dialog, Dialog } from "mdui"
import Avatar from "../Avatar.tsx"
import { checkApiSuccessOrSncakbar } from "../snackbar.ts"
import User from "../../api/client_data/User.ts"
import getUrlForFileByHash from "../../getUrlForFileByHash.ts"
import openImageViewer from "../openImageViewer.ts"
import EventBus from "../../EventBus.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    chat: Chat
    openChatFragment: (id: string) => void
    chatInfoDialogRef: React.MutableRefObject<Dialog>
    openUserInfoDialog: (user: User | string) => void
    sharedFavouriteChats: Chat[]
}

export default function ChatInfoDialog({ chat, chatInfoDialogRef, openChatFragment, openUserInfoDialog, sharedFavouriteChats }: Args) {
    const [chatInfo, setChatInfo] = React.useState(null as unknown as Chat)
    const [favourited, setIsFavourited] = React.useState(false)

    useAsyncEffect(async () => {
        if (chat == null) return
        const re = await Client.invoke("Chat.getInfo", {
            token: data.access_token,
            target: chat.id,
        })
        if (re.code != 200)
            return checkApiSuccessOrSncakbar(re, '获取对话信息失败')

        const info = re.data as Chat
        setIsFavourited(sharedFavouriteChats.map((v) => v.id).indexOf(info.id) != -1)
    }, [chat, sharedFavouriteChats])
    const avatarUrl = getUrlForFileByHash(chat?.avatar_file_hash as string)

    return (
        <mdui-dialog close-on-overlay-click close-on-esc ref={chatInfoDialogRef}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
            }}>
                <Avatar src={avatarUrl} text={chat?.nickname as string} style={{
                    width: '50px',
                    height: '50px',
                }} onClick={() => avatarUrl && openImageViewer(avatarUrl)} />
                <span style={{
                    marginLeft: "15px",
                    fontSize: '16.5px',
                }}>{chat?.title}</span>
            </div>
            <mdui-divider style={{
                marginTop: "10px",
            }}></mdui-divider>

            <mdui-list>
                {
                    chat?.type == 'private' &&
                    <mdui-list-item icon="person" rounded onClick={async () => {
                        const re = await Client.invoke("Chat.getAnotherUserIdFromPrivate", {
                            token: data.access_token,
                            target: chat.id,
                        })
                        if (re.code != 200)
                            return checkApiSuccessOrSncakbar(re, '获取用户失败')

                        openUserInfoDialog(re.data!.user_id as string)
                    }}>用户详情</mdui-list-item>
                }
                <mdui-list-item icon={favourited ? "favorite_border" : "favorite"} rounded onClick={() => dialog({
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
                                ;(async () => {
                                    const re = await Client.invoke(favourited ? "User.removeContacts" : "User.addContacts", {
                                        token: data.access_token,
                                        targets: [
                                            chat.id
                                        ],
                                    })
                                    if (re.code != 200)
                                        checkApiSuccessOrSncakbar(re, favourited ? "取消收藏失败" : "收藏失败")
                                    EventBus.emit('ContactsList.updateContacts')
                                })()
                                return true
                            },
                        }
                    ],
                })}>{favourited ? '取消收藏' : '收藏对话'}</mdui-list-item>
                <mdui-list-item icon="chat" rounded onClick={() => {
                    chatInfoDialogRef.current!.open = false
                    openChatFragment(chat.id)
                }}>打开对话</mdui-list-item>
            </mdui-list>
        </mdui-dialog>
    )
}
