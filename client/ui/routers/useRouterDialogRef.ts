import { Dialog } from "mdui"
import useAsyncEffect from "../../utils/useAsyncEffect"
import sleep from "../../utils/sleep"
import { useBlocker, useNavigate } from "react-router"
import * as React from 'react'

export default function useRouterDialogRef() {
    const dialogRef = React.useRef<Dialog>()
    const shouldBlock = React.useRef(true)
    const nav = useNavigate()
    const blocker = useBlocker(({ currentLocation, nextLocation }) => shouldBlock.current && currentLocation.pathname !== nextLocation.pathname)

    // 避免用户手动返回导致动画丢失
    React.useEffect(() => {
        if (blocker.state === "blocked") {
            // 这个让姐姐来就好啦
            dialogRef.current!.open = false
        }
    }, [blocker])

    useAsyncEffect(async () => {
        await sleep(10)
        dialogRef.current!.open = true
        dialogRef.current!.addEventListener('closed', async () => {
            await sleep(10)
            // 无论如何, 让姐姐先解除返回限制, 这样才能出去嘛
            shouldBlock.current = false
            nav(-1)
        })
    }, [])
    return dialogRef
}
