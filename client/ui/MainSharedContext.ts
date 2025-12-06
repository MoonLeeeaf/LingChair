import { createContext } from 'react'

type shared = {
    ui_functions: React.MutableRefObject<{

    }>
    setShowLoginDialog: React.Dispatch<React.SetStateAction<boolean>>
    setShowRegisterDialog: React.Dispatch<React.SetStateAction<boolean>>
}
const MainSharedContext = createContext({} as shared)

export default MainSharedContext
