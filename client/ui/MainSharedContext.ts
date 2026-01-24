import { Chat } from "lingchair-client-protocol"
import { createContext } from "use-context-selector"
import { SharedState } from "./MainSharedReducer.ts"

type Shared = {
    functions_lazy: React.MutableRefObject<{
        updateFavouriteChats: () => void
        updateRecentChats: () => void
        updateAllChats: () => void
    }>
    state: SharedState
    
    setShowLoginDialog: React.Dispatch<React.SetStateAction<boolean>>
    setShowRegisterDialog: React.Dispatch<React.SetStateAction<boolean>>

    setCurrentSelectedChatId: (id: string) => void
    setFavouriteChats: (chats: Chat[]) => void
}
const MainSharedContext = createContext({} as Shared)

export default MainSharedContext

export type { Shared }
