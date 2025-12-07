import * as React from 'react'
import { Button, Dialog, TextField } from "mdui"
import MainSharedContext, { Shared } from '../MainSharedContext'
import showSnackbar from '../../utils/showSnackbar'
import showCircleProgressDialog from '../showCircleProgressDialog'
import getClient from '../../getClient'
import performAuth from '../../performAuth'
import { useContextSelector } from 'use-context-selector'
import useEventListener from '../../utils/useEventListener'

export default function RegisterDialog({ ...props }: { open: boolean } & React.HTMLAttributes<Dialog>) {
    const shared = useContextSelector(MainSharedContext, (context: Shared) => ({
        setShowRegisterDialog: context.setShowRegisterDialog
    }))

    const dialogRef = React.useRef<Dialog>()
    useEventListener(dialogRef, 'closed', () => shared.setShowRegisterDialog(false))

    const registerInputUserNameRef = React.useRef<TextField>(null)
    const registerInputNickNameRef = React.useRef<TextField>(null)
    const registerInputPasswordRef = React.useRef<TextField>(null)

    return (
        <mdui-dialog headline="注册" {...props} ref={dialogRef}>

            <mdui-text-field label="用户名 (可选)" ref={registerInputUserNameRef}></mdui-text-field>
            <div style={{
                height: "10px",
            }}></div>
            <mdui-text-field label="昵称" ref={registerInputNickNameRef}></mdui-text-field>
            <div style={{
                height: "10px",
            }}></div>
            <mdui-text-field label="密码" type="password" toggle-password ref={registerInputPasswordRef}></mdui-text-field>

            <mdui-button slot="action" variant="text" onClick={() => shared.setShowRegisterDialog(false)}>返回</mdui-button>
            <mdui-button slot="action" variant="text" onClick={async () => {
                const waitingForRegister = showCircleProgressDialog("注册中...")

                const username = registerInputUserNameRef.current!.value

                let user_id: string
                try {
                    user_id = await getClient().registerOrThrow({
                        username: username,
                        nickname: registerInputNickNameRef.current!.value,
                        password: registerInputPasswordRef.current!.value,
                    })
                } catch (e) {
                    user_id = ''
                    if (e instanceof Error) {
                        waitingForRegister.open = false
                        showSnackbar({ message: '注册失败: ' + e.message })
                        return
                    }
                }
                waitingForRegister.open = false

                const waitingForLogin = showCircleProgressDialog("登录中...")

                try {
                    await performAuth({
                        account: username == '' ? username : user_id,
                        password: registerInputPasswordRef.current!.value,
                    })
                    location.reload()
                } catch (e) {
                    if (e instanceof Error) {
                        showSnackbar({ message: '登录失败: ' + e.message })
                    }
                }
                waitingForLogin.open = false
            }}>注册</mdui-button>
        </mdui-dialog>
    )
}