import * as React from 'react'
import { Button, Dialog, TextField, dialog } from "mdui"
import useEventListener from "../useEventListener.ts"
import { checkApiSuccessOrSncakbar, snackbar } from "../snackbar.ts"
import Client from "../../api/Client.ts"

import * as CryptoJS from 'crypto-js'
import data from "../../Data.ts"
import Avatar from "../Avatar.tsx"
import User from "../../api/client_data/User.ts"
import getUrlForFileByHash from "../../getUrlForFileByHash.ts"

interface Refs {
    myProfileDialogRef: React.MutableRefObject<Dialog>
    user: User
}

export default function MyProfileDialog({
    myProfileDialogRef,
    user
}: Refs) {
    const editAvatarButtonRef = React.useRef<HTMLElement>(null)
    const chooseAvatarFileRef = React.useRef<HTMLInputElement>(null)
    useEventListener(editAvatarButtonRef, 'click', () => {
        chooseAvatarFileRef.current!.value = ''
        chooseAvatarFileRef.current!.click()
    })
    useEventListener(chooseAvatarFileRef, 'change', async (_e) => {
        const file = chooseAvatarFileRef.current!.files?.[0] as File
        if (file == null) return

        let re = await Client.uploadFileLikeApi(
            'avatar',
            file
        )
        if (checkApiSuccessOrSncakbar(re, "上传失败")) return
        const hash = re.data!.file_hash
        re = await Client.invoke("User.setAvatar", {
            token: data.access_token,
            file_hash: hash
        })

        if (checkApiSuccessOrSncakbar(re, "修改失败")) return
        snackbar({
            message: "修改成功 (刷新页面以更新)",
            placement: "top",
        })
    })

    const userProfileEditDialogRef = React.useRef<Dialog>(null)
    const editNickNameRef = React.useRef<TextField>(null)
    const editUserNameRef = React.useRef<TextField>(null)

    const accountSettingsDialogRef = React.useRef<Dialog>(null)

    const editPasswordDialogRef = React.useRef<Dialog>(null)
    const editPasswordOldInputRef = React.useRef<TextField>(null)
    const editPasswordNewInputRef = React.useRef<TextField>(null)

    return (<>
        {
            // 公用 - 資料卡
        }
        <mdui-dialog close-on-overlay-click close-on-esc ref={myProfileDialogRef}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
            }}>
                <Avatar src={getUrlForFileByHash(user?.avatar_file_hash)} text={user?.nickname} style={{
                    width: '50px',
                    height: '50px',
                }} />
                <span style={{
                    marginLeft: "15px",
                    fontSize: '16.5px',
                }}>{user?.nickname}</span>
            </div>
            <mdui-divider style={{
                marginTop: "10px",
            }}></mdui-divider>

            <mdui-list>
                <mdui-list-item icon="edit" rounded onClick={() => userProfileEditDialogRef.current!.open = true}>编辑资料</mdui-list-item>
                <mdui-list-item icon="settings" rounded onClick={() => accountSettingsDialogRef.current!.open = true}>账号设定</mdui-list-item>
                {/*
                <mdui-list-item icon="lock" rounded>隱私設定</mdui-list-item>
                */}
                <mdui-list-item icon="logout" rounded onClick={() => dialog({
                    headline: "退出登录",
                    description: "请确保在退出登录前, 设定了用户名或者已经记录下了用户 ID, 以免无法登录账号",
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
                                data.refresh_token = ''
                                data.access_token = ''
                                data.apply()
                                location.reload()
                                return true
                            },
                        }
                    ],
                    closeOnEsc: true,
                    closeOnOverlayClick: true,
                })}>退出登录</mdui-list-item>
            </mdui-list>
        </mdui-dialog>
        {
            // 账号设定
        }
        <mdui-dialog close-on-overlay-click close-on-esc ref={accountSettingsDialogRef} headline="账号设定">
            <mdui-list-item icon="edit" rounded onClick={() => editPasswordDialogRef.current!.open = true}>修改密码</mdui-list-item>
            <mdui-button slot="action" variant="text" onClick={() => accountSettingsDialogRef.current!.open = false}>关闭</mdui-button>
        </mdui-dialog>
        <mdui-dialog close-on-overlay-click close-on-esc ref={editPasswordDialogRef} headline="修改密码">
            <mdui-text-field label="旧密码" type="password" toggle-password ref={editPasswordOldInputRef as any}></mdui-text-field>
            <div style={{
                height: "10px",
            }}></div>
            <mdui-text-field label="新密码" type="password" toggle-password ref={editPasswordNewInputRef as any}></mdui-text-field>

            <mdui-button slot="action" variant="text" onClick={() => editPasswordDialogRef.current!.open = false}>关闭</mdui-button>
            <mdui-button slot="action" variant="text" onClick={async () => {
                const re = await Client.invoke("User.resetPassword", {
                    token: data.access_token,
                    old_password: CryptoJS.SHA256(editPasswordOldInputRef.current?.value || '').toString(CryptoJS.enc.Hex),
                    new_password: CryptoJS.SHA256(editPasswordNewInputRef.current?.value || '').toString(CryptoJS.enc.Hex),
                })

                if (checkApiSuccessOrSncakbar(re, "修改失败")) return
                snackbar({
                    message: "修改成功 (其他客户端需要重新登录)",
                    placement: "top",
                })
                data.access_token = re.data!.access_token as string
                data.refresh_token = re.data!.refresh_token as string
                data.apply()
                editPasswordDialogRef.current!.open = false
            }}>确定</mdui-button>
        </mdui-dialog>
        {
            // 個人資料編輯
        }
        <mdui-dialog close-on-overlay-click close-on-esc ref={userProfileEditDialogRef}>
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
                <Avatar src={getUrlForFileByHash(user?.avatar_file_hash)} text={user?.nickname} avatarRef={editAvatarButtonRef} style={{
                    width: '50px',
                    height: '50px',
                }} />
                <mdui-text-field variant="outlined" placeholder="昵称" ref={editNickNameRef as any} style={{
                    marginLeft: "15px",
                }} value={user?.nickname}></mdui-text-field>
            </div>
            <mdui-divider style={{
                marginTop: "10px",
            }}></mdui-divider>

            <mdui-text-field style={{ marginTop: "10px", }} variant="outlined" label="用户 ID" value={user?.id || ''} readonly onClick={(e) => {
                const input = e.target as HTMLInputElement
                input.select()
                input.setSelectionRange(0, 1145141919810)
            }}></mdui-text-field>
            <mdui-text-field style={{ marginTop: "20px", }} variant="outlined" label="用户名" value={user?.username || ''} ref={editUserNameRef as any}></mdui-text-field>

            <mdui-button slot="action" variant="text" onClick={() => userProfileEditDialogRef.current!.open = false}>取消</mdui-button>
            <mdui-button slot="action" variant="text" onClick={async () => {
                const re = await Client.invoke("User.updateProfile", {
                    token: data.access_token,
                    nickname: editNickNameRef.current?.value,
                    username: editUserNameRef.current?.value,
                })

                if (checkApiSuccessOrSncakbar(re, "修改失败")) return
                snackbar({
                    message: "修改成功 (刷新页面以更新)",
                    placement: "top",
                })
                userProfileEditDialogRef.current!.open = false
            }}>更新</mdui-button>
        </mdui-dialog>
    </>)
}