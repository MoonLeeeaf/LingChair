import * as React from 'react'
import { Dialog, TextField } from "mdui"
import showSnackbar from '../../utils/showSnackbar.ts'
import { CallbackError } from 'lingchair-client-protocol'
import useEventListener from '../../utils/useEventListener.ts'
import ClientCache from '../../ClientCache.ts'

export default function AddFavourtieChatDialog({ useRef }: { useRef: React.MutableRefObject<Dialog | null> }) {
    const inputTargetRef = React.useRef<TextField>(null)

    useEventListener(useRef, 'closed', () => {
        inputTargetRef.current!.value = ''
    })

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
        <mdui-dialog close-on-overlay-click close-on-esc headline="添加收藏对话" ref={useRef}>
            <mdui-text-field clearable label="对话 / 用户 (ID 或 别名)" ref={inputTargetRef} onKeyDown={(event) => {
                if (event.key == 'Enter')
                    addFavouriteChat()
            }}></mdui-text-field>
            <mdui-button slot="action" variant="text" onClick={() => useRef.current!.open = false}>取消</mdui-button>
            <mdui-button slot="action" variant="text" onClick={() => addFavouriteChat()}>添加</mdui-button>
        </mdui-dialog>
    )
}
