import { Chat, User } from 'lingchair-client-protocol'
import * as React from 'react'

type AppState = {
    openChatInfo: (chat: Chat | string) => void
    openUserInfo: (user: Chat | User | string) => void
    openEditMyProfile: () => void
    openAddFavouriteChat: () => void
    openCreateGroup: () => void
    openChat: (chat: string | Chat, inDialog?: boolean) => void
    closeChat: () => void
}

const AppStateContext = React.createContext<AppState>({
    openChatInfo: () => {},
    openUserInfo: () => {},
    openEditMyProfile: () => {},
    openAddFavouriteChat: () => {},
    openCreateGroup: () => {},
    openChat: () => {},
    closeChat: () => {},
})

export type { AppState }

export default AppStateContext
