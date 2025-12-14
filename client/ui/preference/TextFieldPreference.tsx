import React from 'react'
import { prompt } from 'mdui'
import PreferenceUpdater from "./PreferenceUpdater.ts"

interface Args extends React.HTMLAttributes<HTMLElement> {
    title: string
    description?: string
    icon: string
    id: string
    state: string
    disabled?: boolean
}

export default function TextFieldPreference({ title, icon, description, id, state, disabled }: Args) {
    const updater = React.useContext(PreferenceUpdater)

    return <mdui-list-item icon={icon} rounded disabled={disabled ? true : undefined} onClick={() => {
        prompt({
            headline: title,
            confirmText: "确定",
            cancelText: "取消",
            onConfirm: (value) => {
                updater(id, value)
            },
            onCancel: () => { },
            textFieldOptions: {
                label: description,
                value: state,
            },
            closeOnEsc: true,
            closeOnOverlayClick: true,
        })
    }}>
        {title}
        {description && <span slot="description">{description}</span>}
    </mdui-list-item>
}