import { Dialog } from "mdui"
import useAsyncEffect from "../../utils/useAsyncEffect"
import sleep from "../../utils/sleep"
import { BlockerFunction, useBlocker, useNavigate } from "react-router"
import * as React from 'react'

export default function useRouterDialogRef() {
    const dialogRef = React.useRef<Dialog>()
    const proceedRef = React.useRef<() => void>()
    const shouldBlock = React.useRef(true)
    const nav = useNavigate()
    const blocker = useBlocker(React.useCallback<BlockerFunction>(() => shouldBlock.current, []))

    // 避免用户手动返回导致动画丢失
    React.useEffect(() => {
        if (blocker.state === "blocked") {
            proceedRef.current = blocker.proceed
            // 这个让姐姐来就好啦
            dialogRef.current!.open = false
        }
    }, [blocker.state])

    useAsyncEffect(async () => {
        await sleep(10)
        dialogRef.current!.open = true
        dialogRef.current!.addEventListener('closed', async () => {
            shouldBlock.current = false
            await sleep(10)
            proceedRef.current ? proceedRef.current() : nav(-1)
        })
    }, [])
    return dialogRef
}
