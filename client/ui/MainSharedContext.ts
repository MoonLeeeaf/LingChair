import { Chat, UserMySelf } from "lingchair-client-protocol"
import { createContext } from "use-context-selector"
import { SharedState } from "./MainSharedReducer"

type Shared = {
    functions_lazy: React.MutableRefObject<{
        updateFavouriteChats: () => void
        updateRecentChats: () => void
        updateAllChats: () => void
    }>
    state: SharedState
    
    setShowLoginDialog: React.Dispatch<React.SetStateAction<boolean>>
    setShowRegisterDialog: React.Dispatch<React.SetStateAction<boolean>>
    setShowAddFavourtieChatDialog: React.Dispatch<React.SetStateAction<boolean>>

    setCurrentSelectedChatId: React.Dispatch<React.SetStateAction<string>>
}
const MainSharedContext = createContext({} as Shared)

export default MainSharedContext

export type { Shared }
