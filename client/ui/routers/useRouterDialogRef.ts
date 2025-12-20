import { Dialog } from "mdui"
import useAsyncEffect from "../../utils/useAsyncEffect"
import sleep from "../../utils/sleep"
import { BlockerFunction, useBlocker, useNavigate } from "react-router"
import * as React from 'react'
import RouterDialogsContext from './RouterDialogsContext'

export default function useRouterDialogRef() {
    const dialogRef = React.useRef<Dialog>(RouterDialogsContext)
    const registerRouterDialog = React.useContext(RouterDialogsContext)
    
    useAsyncEffect(async () => {
        registerRouterDialog(dialogRef)
        await sleep(10)
        dialogRef.current!.open = true
    }, [])
    
    return dialogRef
}
