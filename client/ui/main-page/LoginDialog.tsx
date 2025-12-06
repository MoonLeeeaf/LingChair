import * as React from 'react'
import { Button, Dialog, TextField } from "mdui"

import performAuth from '../../performAuth.ts'
import useEventListener from '../../utils/useEventListener.ts'
import showSnackbar from '../../utils/showSnackbar.ts'

export default function LoginDialog({ ...props }: { open: boolean } & React.HTMLAttributes<Dialog>) {
    const loginDialogRef = React.useRef<Dialog>(null)
    const loginButtonRef = React.useRef<Button>(null)
    const registerButtonRef = React.useRef<Button>(null)
    const loginInputAccountRef = React.useRef<TextField>(null)
    const loginInputPasswordRef = React.useRef<TextField>(null)

    useEventListener(loginButtonRef, 'click', async () => {
        const account = loginInputAccountRef.current!.value
        const password = loginInputPasswordRef.current!.value

        try {
            await performAuth({
                account: account,
                password: password,
            })
            location.reload()
        } catch (e) {
            if (e instanceof Error)
                showSnackbar({ message: '登录失败: ' + e.message })
        }
    })

    return (
        <mdui-dialog {...props} headline="登录" ref={loginDialogRef}>

            <mdui-text-field label="用户 ID / 用户名" ref={loginInputAccountRef}></mdui-text-field>
            <div style={{
                height: "10px",
            }}></div>
            <mdui-text-field label="密码" type="password" toggle-password ref={loginInputPasswordRef}></mdui-text-field>

            <mdui-button slot="action" variant="text" ref={registerButtonRef}>注册</mdui-button>
            <mdui-button slot="action" variant="text" ref={loginButtonRef}>登录</mdui-button>
        </mdui-dialog>
    )
}