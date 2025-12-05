customElements.define('chat-text-container', class extends HTMLElement {
    declare container: HTMLDivElement
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
        const shadow = this.shadowRoot as ShadowRoot
        
        this.container = document.createElement('div')
        this.container.style.padding = '13px'
        shadow.appendChild(this.container)
        this.container.innerHTML = this.innerHTML
    }
})
