import React from 'react'
import { Dropdown } from 'mdui'
import PreferenceUpdater from "./PreferenceUpdater.ts"
import useEventListener from '../../utils/useEventListener.ts'

interface Args extends React.HTMLAttributes<HTMLElement> {
    title: string
    icon: string
    id: string
    disabled?: boolean
    selections: { [id: string]: string }
    state: string
}

export default function SelectPreference({ title, icon, id: preferenceId, selections, state, disabled }: Args) {
    const updater = React.useContext(PreferenceUpdater)

    const dropDownRef = React.useRef<Dropdown>(null)
    const [isDropDownOpen, setDropDownOpen] = React.useState(false)

    useEventListener(dropDownRef, 'closed', () => {
        setDropDownOpen(false)
    })
    return <mdui-list-item icon={icon} rounded disabled={disabled ? true : undefined} onClick={() => setDropDownOpen(!isDropDownOpen)}>
        <mdui-dropdown ref={dropDownRef} trigger="manual" open={isDropDownOpen}>
            <span slot="trigger">{title}</span>
            <mdui-menu onClick={(e: MouseEvent) => {
                e.stopPropagation()
                setDropDownOpen(false)
            }}>
                {
                    Object.keys(selections).map((id) =>
                        // @ts-ignore: selected 确实存在, 但是并不对外公开使用
                        <mdui-menu-item key={id} selected={state == id ? true : undefined} onClick={() => {
                            updater(preferenceId, id)
                        }}>{selections[id]}</mdui-menu-item>
                    )
                }
            </mdui-menu>
        </mdui-dropdown>
        <span slot="description">{selections[state]}</span>
    </mdui-list-item>
}