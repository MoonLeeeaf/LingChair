import useRouterDialogRef from "./useRouterDialogRef"
import * as React from 'react'

export default function ChatFragmentDialog() {
    const dialogRef = useRouterDialogRef()

    return <mdui-dialog fullscreen ref={dialogRef}></mdui-dialog>
}
