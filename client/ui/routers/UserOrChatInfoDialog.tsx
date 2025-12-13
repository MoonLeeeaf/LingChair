import { dialog } from "mdui"
import useRouterDialogRef from "./useRouterDialogRef"
import { BlockerFunction, useBlocker, useLocation, useNavigate, useParams, useSearchParams } from "react-router"
import useAsyncEffect from "../../utils/useAsyncEffect"
import { CallbackError, Chat } from "lingchair-client-protocol"
import showSnackbar from "../../utils/showSnackbar"
import getClient from "../../getClient"
import Avatar from "../Avatar"
import { useContextSelector } from "use-context-selector"
import MainSharedContext, { Shared } from "../MainSharedContext"
import * as React from 'react'

export default function UserOrChatInfoDialog() {
    const shared = useContextSelector(MainSharedContext, (context: Shared) => ({
        myProfileCache: context.myProfileCache,
        favouriteChats: context.favouriteChats,
    }))

    const dialogRef = useRouterDialogRef()

    const location = useLocation()
    const searchParams = useSearchParams()
    const params = useParams()

    return (
        <mdui-dialog close-on-overlay-click close-on-esc ref={dialogRef}>
            <span style={{
                wordBreak: "break-word",
            }} dangerouslySetInnerHTML={{
                __html: "↓ searchParams<br><br>"
                    + Object.keys(location)
                        // @ts-ignore 懒
                        .map((k) => `${k} = ${location[k]}`)
                        .join('<br><br>')
                    + "<br><br>↓ searchParams<br><br>" + Object.keys(searchParams)
                        // @ts-ignore 懒
                        .map((k) => `${k} = ${searchParams[k]}`)
                        .join('<br><br>')
                    + "<br><br>↓ params<br><br>" + Object.keys(params)
                        // @ts-ignore 懒
                        .map((k) => `${k} = ${params[k]}`)
                        .join('<br><br>')
            }}></span>
        </mdui-dialog>
    )
}
