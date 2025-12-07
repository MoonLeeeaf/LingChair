import React from 'react'
import { dialog, Dialog } from "mdui"
import Avatar from "../Avatar.tsx"
import { CallbackError, Chat } from 'lingchair-client-protocol'
import { data, useLocation, useNavigate, useSearchParams } from 'react-router'
import useAsyncEffect from '../../utils/useAsyncEffect.ts'
import { useContextSelector } from 'use-context-selector'
import MainSharedContext, { Shared } from '../MainSharedContext.ts'
import getClient from '../../getClient.ts'
import useEventListener from '../../utils/useEventListener.ts'
import showSnackbar from '../../utils/showSnackbar.ts'

export default function ChatInfoDialog({ ...props }: React.HTMLAttributes<HTMLElement>) {
    const shared = useContextSelector(MainSharedContext, (context: Shared) => ({
        myProfileCache: context.myProfileCache,
        favouriteChats: context.favouriteChats,
    }))

    const [chat, setChat] = React.useState<Chat>()
    const [userId, setUserId] = React.useState<string>()

    const [searchParams] = useSearchParams()
    let currentLocation = useLocation()
    const navigate = useNavigate()
    function back() {
        navigate(-1)
    }
    const dialogRef = React.useRef<Dialog>()
    useEventListener(dialogRef, 'overlay-click', () => back())
    const id = searchParams.get('id')

    const [favourited, setIsFavourited] = React.useState(false)
    React.useEffect(() => {
        setIsFavourited(shared.favouriteChats.map((v) => v.getId()).indexOf(chat?.getId() || '') != -1)
    }, [chat, shared])

    React.useEffect(() => {
        console.log(currentLocation)
    }, [currentLocation])

    useAsyncEffect(async () => {
        console.log(id, currentLocation.pathname)
        try {
            if (!currentLocation.pathname.startsWith('/info/')) {
                dialogRef.current!.open = false
                return
            }

            if (id == null) {
                dialogRef.current!.open = false
                return back()
            }

            if (currentLocation.pathname.startsWith('/info/user')) {
                setChat(await Chat.getOrCreatePrivateChatOrThrow(getClient(), id))
                setUserId(id)
            } else
                setChat(await Chat.getByIdOrThrow(getClient(), id))
            dialogRef.current!.open = true
        } catch (e) {
            if (e instanceof CallbackError)
                showSnackbar({
                    message: '打开资料卡失败: ' + e.message
                })
            console.log(e)
            back()
        }
    }, [id, currentLocation])

    if (!currentLocation.pathname.startsWith('/info/'))
        return null

    const avatarUrl = getClient().getUrlForFileByHash(chat?.getAvatarFileHash())!

    return (
        <mdui-dialog ref={dialogRef}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
            }}>
                <Avatar src={avatarUrl} text={chat?.getTitle()} style={{
                    width: '50px',
                    height: '50px',
                }} onClick={() => avatarUrl && openImageViewer(avatarUrl)} />
                <div style={{
                    display: 'flex',
                    marginLeft: '15px',
                    marginRight: '15px',
                    fontSize: '16.5px',
                    flexDirection: 'column',
                }}>
                    <span style={{
                        fontSize: '16.5px'
                    }}>{chat?.getTitle()}</span>
                    <span style={{
                        fontSize: '10.5px',
                        marginTop: '3px',
                        color: 'rgb(var(--mdui-color-secondary))',
                    }}>({chat?.getType()}) ID: {chat?.getType() == 'private' ? userId : chat?.getId()}</span>
                </div>
            </div>
            <mdui-divider style={{
                marginTop: "10px",
            }}></mdui-divider>

            <mdui-list>
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
                                ; (async () => {
                                    const re = await Client.invoke(favourited ? "User.removeContacts" : "User.addContacts", {
                                        token: data.access_token,
                                        targets: [
                                            chat!.id
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
                    openChatFragment(chat!.id)
                }}>打开对话</mdui-list-item>
            </mdui-list>
        </mdui-dialog>
    )
}

