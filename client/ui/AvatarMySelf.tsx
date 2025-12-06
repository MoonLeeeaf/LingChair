import { UserMySelf } from "lingchair-client-protocol"
import useAsyncEffect from "../utils/useAsyncEffect.ts"
import Avatar from "./Avatar.tsx"
import getClient from "../getClient.ts"
import React from "react"

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
        const mySelf = await UserMySelf.getMySelfOrThrow(getClient())
        setArgs({
            text: mySelf.getNickName(),
            src: getClient().getUrlForFileByHash(mySelf.getAvatarFileHash(), '')!
        })
    })

    return <Avatar avatarRef={avatarRef} {...props} {...args}></Avatar>
}
