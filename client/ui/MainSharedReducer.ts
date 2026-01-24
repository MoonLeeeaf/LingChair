import { Chat } from "lingchair-client-protocol"

export interface SharedState {
    favouriteChats: Chat[]
    currentSelectedChatId: string
}

type Action =
    | { type: 'update_favourite_chat', data: Chat[] }
    | { type: 'update_selected_chat_id', data: string }

export default function MainSharedReducer(state: SharedState, action: Action): SharedState {
    switch (action.type) {
        case 'update_favourite_chat':
            return { ...state, favouriteChats: action.data }
        case 'update_selected_chat_id':
            return { ...state, currentSelectedChatId: action.data }
        default:
            return state
    }
}
