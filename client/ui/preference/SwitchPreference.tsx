import { Switch } from 'mdui'
import React from 'react'
import PreferenceUpdater from "./PreferenceUpdater.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    title: string
    id: string
    description?: string
    icon: string
    state: boolean
    disabled?: boolean
}

export default function SwitchPreference({ title, icon, id, disabled, description, state }: Args) {
    const updater = React.useContext(PreferenceUpdater)

    const switchRef = React.useRef<Switch>(null)
    
    React.useEffect(() => {
        switchRef.current!.checked = state
    }, [state])

    return <mdui-list-item disabled={disabled ? true : undefined} rounded icon={icon} onClick={() => {
        updater(id, !state)
    }}>
        {title}
        {description && <span slot="description">{description}</span>}
        <mdui-switch slot="end-icon" checked-icon="" ref={switchRef} onClick={(e) => e.preventDefault()}></mdui-switch>
    </mdui-list-item>
}