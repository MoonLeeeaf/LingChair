import * as React from 'react'
import { Dialog, TextField } from "mdui"

import performAuth from '../../performAuth.ts'
import showSnackbar from '../../utils/showSnackbar.ts'
import MainSharedContext, { Shared } from '../MainSharedContext.ts'
import { useContextSelector } from 'use-context-selector'
import useEventListener from '../../utils/useEventListener.ts'

export default function LoginDialog({ ...props }: { open: boolean } & React.HTMLAttributes<Dialog>) {
    const shared = useContextSelector(MainSharedContext, (context: Shared) => ({
        setShowRegisterDialog: context.setShowRegisterDialog,
        setShowLoginDialog: context.setShowLoginDialog
    }))

    const dialogRef = React.useRef<Dialog>()
    useEventListener(dialogRef, 'closed', () => shared.setShowLoginDialog(false))

    const loginInputAccountRef = React.useRef<TextField>(null)
    const loginInputPasswordRef = React.useRef<TextField>(null)

    return (
        <mdui-dialog {...props} headline="登录" ref={dialogRef}>

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