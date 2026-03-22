import * as React from 'react'
import { Dialog, TextField } from "mdui"
import showSnackbar from '../../utils/showSnackbar'
import { CallbackError, Chat } from 'lingchair-client-protocol'
import useEventListener from '../../utils/useEventListener.ts'
import getClient from '../../getClient.ts'

export default function CreateGroupDialog({ useRef }: { useRef: React.MutableRefObject<Dialog | null> }) {
    const inputTargetRef = React.useRef<TextField>(null)

    useEventListener(useRef, 'closed', () => {
        inputTargetRef.current!.value = ''
    })

    async function createGroup() {
        try {
            await Chat.createGroupOrThrow(getClient(), inputTargetRef.current!.value)
            inputTargetRef.current!.value = ''
            showSnackbar({
                message: '创建成功!'
            })
            useRef.current!.open = false
        } catch (e) {
            if (e instanceof CallbackError)
                showSnackbar({
                    message: '创建群组失败: ' + e.message
                })
        }
    }

    return (
        <mdui-dialog close-on-overlay-click close-on-esc headline="创建群组" ref={useRef}>
            <mdui-text-field clearable label="群组标题" ref={inputTargetRef} onKeyDown={(event) => {
                if (event.key == 'Enter')
                    createGroup()
            }}></mdui-text-field>
            <mdui-button slot="action" variant="text" onClick={() => useRef.current!.open = false}>取消</mdui-button>
            <mdui-button slot="action" variant="text" onClick={() => createGroup()}>创建</mdui-button>
        </mdui-dialog>
    )
}
