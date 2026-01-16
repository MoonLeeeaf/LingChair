import { $ } from "mdui"

export default class MduiPatchedTextAreaElement extends HTMLElement {
    static observedAttributes = ['value', 'placeholder']
    declare inputDiv?: HTMLDivElement
    declare inputContainerDiv?: HTMLDivElement
    declare placeholder?: string | number | null
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
    }

    _lastValue = ''
    connectedCallback() {
        const shadow = this.shadowRoot as ShadowRoot

        this.inputContainerDiv = new DOMParser().parseFromString(`
            <div style="overflow-y: auto; height: 100%;">
                <div role="textbox" aria-multiline="true" aria-labelledby="txtboxMultilineLabel" contentEditable="true" style="outline: none !important; color: rgb(var(--mdui-color-on-surface-variant)); display: inline-block; word-break: break-word; white-space: pre-wrap;"></div>
                <style>
                    [contenteditable="true"]:empty:before {
                        content: attr(data-placeholder);
                    }
                    *::-webkit-scrollbar {
                        width: 7px;
                        height: 10px;
                    }

                    *::-webkit-scrollbar-track {
                        width: 6px;
                        background: rgba(#101f1c, 0.1);
                        -webkit-border-radius: 2em;
                        -moz-border-radius: 2em;
                        border-radius: 2em;
                    }

                    *::-webkit-scrollbar-thumb {
                        background-color: rgba(144, 147, 153, 0.5);
                        background-clip: padding-box;
                        min-height: 28px;
                        -webkit-border-radius: 2em;
                        -moz-border-radius: 2em;
                        border-radius: 2em;
                        transition: background-color 0.3s;
                        cursor: pointer;
                    }

                    *::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(144, 147, 153, 0.3);
                    }
                </style>
            </div>
        `, 'text/html').body.firstChild as HTMLDivElement

        this.inputDiv = this.inputContainerDiv.children[0] as HTMLDivElement

        this.inputDiv.addEventListener('blur', () => {
            if (this._lastValue !== this.value) {
                this._lastValue = this.value || ''
                this.dispatchEvent(new Event('change', { bubbles: true }))
            }
        })
        this.inputDiv.addEventListener('paste', (e: ClipboardEvent) => {
            e.preventDefault()
            document.execCommand('insertText', false, e.clipboardData?.getData("text/plain") || '')
        })

        this.inputDiv.style.width = '100%'

        $(this.inputDiv).attr('data-placeholder', $(this).attr('placeholder'))

        shadow.appendChild(this.inputContainerDiv)
    }
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        // console.log(this.inputDiv, name, oldValue, newValue)
        switch (name) {
            case 'value': {
                this.value = newValue || ''
                break
            }
            case 'placeholder': {
                this.inputDiv && $(this.inputDiv).attr('data-placeholder', newValue)
                break
            }
        }
    }
    focus() {
        this.inputDiv?.focus()
    }
    blur() {
        this.inputDiv?.blur()
    }
    checkValidity() {
        // TODO: implment this method
        return true
    }
    get value() {
        return this.inputDiv?.textContent || ''
    }
    set value(v) {
        this.inputDiv && (this.inputDiv.textContent = v)
    }
}

customElements.define('mdui-patched-textarea', MduiPatchedTextAreaElement)
