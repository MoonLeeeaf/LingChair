import { $ } from "mdui"

export default class MduiPatchedTextAreaElement extends HTMLElement {
    static observedAttributes = ['user-id']
    declare inputDiv: HTMLDivElement
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
    }

    _lastValue = ''
    connectedCallback() {
        const shadow = this.shadowRoot as ShadowRoot

        this.inputDiv = new DOMParser().parseFromString(`
            <div contentEditable="true" style="outline: none !important; color: rgb(var(--mdui-color-on-surface-variant)); display: inline-block; word-wrap: break-word; white-space: pre-wrap;"></div>
        `, 'text/html').body.firstChild as HTMLDivElement
        this.inputDiv.contentEditable = 'true'

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

        shadow.appendChild(this.inputDiv)
    }
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        switch (name) {
            case 'value': {
                this.value = newValue || ''
                break
            }
        }
    }
    focus() {
        this.inputDiv.focus()
    }
    blur() {
        this.inputDiv.blur()
    }
    get value() {
        return this.inputDiv.textContent
    }
    set value(v) {
        this.inputDiv.textContent = v
    }
}

customElements.define('mdui-patched-textarea', MduiPatchedTextAreaElement)
