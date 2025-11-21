import * as React from 'react'
import { $, TextField } from "mdui"

interface Args extends React.HTMLAttributes<TextField & HTMLElement> {

}

export default function TextFieldCustom({ ...prop }: Args) {
    // deno-lint-ignore no-explicit-any
    const textField = React.useRef<any>(null)

    React.useEffect(() => {
        const shadow = (textField.current as TextField).shadowRoot
        // $(shadow).find('textarea')
    })

    return <mdui-text-field {...prop} ref={textField}></mdui-text-field>
}