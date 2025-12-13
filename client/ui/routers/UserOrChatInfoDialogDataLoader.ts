import { LoaderFunctionArgs } from "react-router"
import getClient from "../../getClient"
import { Chat } from "lingchair-client-protocol"
import ClientCache from "../../ClientCache"

export default async function UserOrChatInfoDialogLoader({ params, request }: LoaderFunctionArgs) {
    const searchParams = new URL(request.url).searchParams

    let id = searchParams.get('id')
    let chat: Chat
    if (params.type == 'user')
        chat = await Chat.getOrCreatePrivateChatOrThrow(getClient(), id!)
    else
        chat = await Chat.getByIdOrThrow(getClient(), id!)

    if (chat.getType() == 'private')
        id = await chat.getTheOtherUserIdOrThrow()

    return {
        mySelf: await ClientCache.getMySelf(),
        chat,
        id,
    }
}
