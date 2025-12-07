import * as React from 'react'
import { Button, Dialog, snackbar, TextField } from "mdui"
import { data } from 'react-router'
import { useContextSelector } from 'use-context-selector'
import MainSharedContext, { Shared } from '../MainSharedContext'
import showSnackbar from '../../utils/showSnackbar'
import { CallbackError } from 'lingchair-client-protocol'
import useEventListener from '../../utils/useEventListener'

export default function AddFavourtieChatDialog({ ...props }: { open: boolean } & React.HTMLAttributes<Dialog>) {
    const shared = useContextSelector(MainSharedContext, (context: Shared) => ({
        myProfileCache: context.myProfileCache,
        setShowAddFavourtieChatDialog: context.setShowAddFavourtieChatDialog,
    }))

    const dialogRef = React.useRef<Dialog>()
    useEventListener(dialogRef, 'closed', () => shared.setShowAddFavourtieChatDialog(false))

    const inputTargetRef = React.useRef<TextField>(null)

    async function addFavouriteChat() {
        try {
            shared.myProfileCache!.addFavouriteChatsOrThrow([inputTargetRef.current!.value])
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
            <mdui-button slot="action" variant="text" onClick={() => shared.setShowAddFavourtieChatDialog(false)}>取消</mdui-button>
            <mdui-button slot="action" variant="text" onClick={() => addFavouriteChat()}>添加</mdui-button>
        </mdui-dialog>
    )
}
