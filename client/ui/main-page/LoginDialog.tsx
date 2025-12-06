import * as React from 'react'
import { Button, Dialog, TextField } from "mdui"

import performAuth from '../../performAuth.ts'
import showSnackbar from '../../utils/showSnackbar.ts'
import MainSharedContext from '../MainSharedContext.ts'

export default function LoginDialog({ ...props }: { open: boolean } & React.HTMLAttributes<Dialog>) {
    const shared = React.useContext(MainSharedContext)

    const loginInputAccountRef = React.useRef<TextField>(null)
    const loginInputPasswordRef = React.useRef<TextField>(null)

    return (
        <mdui-dialog {...props} headline="登录">

            <mdui-text-field label="用户 ID / 用户名" ref={loginInputAccountRef}></mdui-text-field>
            <div style={{
                height: "10px",
            }}></div>
            <mdui-text-field label="密码" type="password" toggle-password ref={loginInputPasswordRef}></mdui-text-field>

            <mdui-button slot="action" variant="text" onClick={() => shared.setShowRegisterDialog(true)}>注册</mdui-button>
            <mdui-button slot="action" variant="text" onClick={async () => {
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
            }}>登录</mdui-button>
        </mdui-dialog>
    )
}