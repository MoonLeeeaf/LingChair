import { CallbackError, UserMySelf } from "lingchair-client-protocol"
import ClientCache from "../../ClientCache.ts"
import AvatarMySelf from "../AvatarMySelf.tsx"
import useAsyncEffect from "../../utils/useAsyncEffect.ts"
import getClient from "../../getClient.ts"
import showSnackbar from "../../utils/showSnackbar.ts"
import useEventListener from "../../utils/useEventListener.ts"
import { Dialog, TextField } from "mdui"
import * as React from 'react'

export default function EditMyProfileDialog({ useRef }: { useRef: React.MutableRefObject<Dialog | null> }) {
    const [mySelf, setMySelf] = React.useState<UserMySelf>()
    useAsyncEffect(async () => setMySelf(await ClientCache.getMySelf() as UserMySelf))

    const chooseAvatarFileRef = React.useRef<HTMLInputElement>(null)

    const editNickNameRef = React.useRef<TextField>(null)
    const editUserNameRef = React.useRef<TextField>(null)

    useEventListener(chooseAvatarFileRef, 'change', async (_) => {
        const file = chooseAvatarFileRef.current!.files?.[0] as File
        if (file == null) return

        try {
            const hash = await getClient().uploadFile({
                fileName: 'UserAvatar',
                fileData: file,
            })
            await mySelf?.setAvatarFileHashOrThrow(hash)
            showSnackbar({
                message: "修改成功, 刷新页面以更新",
            })
        } catch (e) {
            console.error(e)
            if (e instanceof CallbackError)
                showSnackbar({
                    message: '上传头像失败: ' + e.message
                })
            showSnackbar({
                message: '上传头像失败: ' + (e instanceof Error ? e.message : e)
            })
        }
    })

    return (
        <mdui-dialog close-on-overlay-click close-on-esc ref={useRef}>
            <div style={{
                display: "none"
            }}>
                <input type="file" name="选择头像" ref={chooseAvatarFileRef}
                    accept="image/*" />
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
            }}>
                <AvatarMySelf onClick={() => {
                    chooseAvatarFileRef.current!.value = ''
                    chooseAvatarFileRef.current!.click()
                }} style={{
                    width: '50px',
                    height: '50px',
                }} />
                <mdui-text-field variant="outlined" placeholder="昵称" ref={editNickNameRef} style={{
                    marginLeft: "15px",
                }} value={mySelf?.getNickName()}></mdui-text-field>
            </div>
            <mdui-divider style={{
                marginTop: "10px",
            }}></mdui-divider>

            <mdui-text-field style={{ marginTop: "10px", }} variant="outlined" label="用户 ID" value={mySelf?.getId() || ''} readonly onClick={(e) => {
                const input = e.target as HTMLInputElement
                input.select()
                input.setSelectionRange(0, 1145141919810)
            }}></mdui-text-field>
            <mdui-text-field style={{ marginTop: "20px", }} variant="outlined" label="用户名" value={mySelf?.getUserName() || ''} ref={editUserNameRef}></mdui-text-field>

            <mdui-button slot="action" variant="text" onClick={() => useRef.current!.open = false}>取消</mdui-button>
            <mdui-button slot="action" variant="text" onClick={async () => {
                try {
                    await mySelf?.updateProfileOrThrow({
                        nickname: editNickNameRef.current?.value,
                        username: editUserNameRef.current?.value,
                    })
                } catch (e) {
                    if (e instanceof CallbackError)
                        showSnackbar({
                            message: '更新资料失败: ' + e.message
                        })
                }
                showSnackbar({
                    message: "修改成功, 刷新页面以更新",
                })
            }}>更新</mdui-button>
        </mdui-dialog>
    )
}