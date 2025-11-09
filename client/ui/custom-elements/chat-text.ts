import { $ } from 'mdui'

customElements.define('chat-text', class extends HTMLElement {
    declare span: HTMLSpanElement
    static observedAttributes = ['underline', 'em']
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
        const shadow = this.shadowRoot as ShadowRoot
        
        this.span = document.createElement('span')
        this.span.style.whiteSpace = 'pre-wrap'
        this.span.style.fontSynthesis = 'style weight'
        shadow.appendChild(this.span)

        this.update()
    }
    attributeChangedCallback(_name: string, _oldValue: unknown, _newValue: unknown) {
        this.update()
    }
    update() {
        if (this.span == null) return
        
        this.span.textContent = this.textContent
        this.span.style.textDecoration = $(this).attr('underline') ? 'underline' : ''
        this.span.style.fontStyle = $(this).attr('em') ? 'italic' : ''
    }
})
