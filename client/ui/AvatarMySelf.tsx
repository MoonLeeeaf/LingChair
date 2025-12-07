import { UserMySelf } from "lingchair-client-protocol"
import useAsyncEffect from "../utils/useAsyncEffect.ts"
import Avatar from "./Avatar.tsx"
import getClient from "../getClient.ts"
import React from "react"
import sleep from "../utils/sleep.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    avatarRef?: React.LegacyRef<HTMLElement>
}
export default function AvatarMySelf({
    avatarRef,
    ...props
}: Args) {
    if (!avatarRef) avatarRef = React.useRef<HTMLElement>(null)
    const [args, setArgs] = React.useState<{
        text: string,
        src: string,
    }>({
        text: '',
        src: '',
    })

    useAsyncEffect(async () => {
        await sleep(200)
        const mySelf = await UserMySelf.getMySelfOrThrow(getClient())
        setArgs({
            text: mySelf.getNickName(),
            src: getClient().getUrlForFileByHash(mySelf.getAvatarFileHash(), '')!
        })
    })

    return <Avatar avatarRef={avatarRef} {...props} text={args.text} src={args.src}></Avatar>
}
