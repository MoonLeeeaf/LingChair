import * as React from 'react'
import { Button, Dialog, snackbar, TextField } from "mdui"
import { data, useNavigate } from 'react-router'
import { useContextSelector } from 'use-context-selector'
import MainSharedContext, { Shared } from '../MainSharedContext'
import showSnackbar from '../../utils/showSnackbar'
import { CallbackError } from 'lingchair-client-protocol'
import useEventListener from '../../utils/useEventListener'
import ClientCache from '../../ClientCache'
import useRouterDialogRef from './useRouterDialogRef'

export default function AddFavourtieChatDialog({ ...props }: { open: boolean } & React.HTMLAttributes<Dialog>) {
    const dialogRef = useRouterDialogRef()
    const nav = useNavigate()

    const inputTargetRef = React.useRef<TextField>(null)

    async function addFavouriteChat() {
        try {
            await (await ClientCache.getMySelf())!.addFavouriteChatsOrThrow([inputTargetRef.current!.value])
            inputTargetRef.current!.value = ''
            showSnackbar({
                message: '添加成功!'
            })
        } catch (e) {
            if (e instanceof CallbackError)
                    showSnackbar({
                        message: '添加收藏对话失败: ' + e.message
                    })
        }
    }

    return (
        <mdui-dialog close-on-overlay-click close-on-esc headline="添加收藏对话" {...props} ref={dialogRef}>
            <mdui-text-field clearable label="对话 / 用户 (ID 或 别名)" ref={inputTargetRef} onKeyDown={(event: KeyboardEvent) => {
                if (event.key == 'Enter')
                    addFavouriteChat()
            }}></mdui-text-field>
            <mdui-button slot="action" variant="text" onClick={() => nav(-1)}>取消</mdui-button>
            <mdui-button slot="action" variant="text" onClick={() => addFavouriteChat()}>添加</mdui-button>
        </mdui-dialog>
    )
}
