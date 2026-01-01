export default class InnerTextContainerElement extends HTMLElement {
    static observedAttributes = ['text']
    declare textContainer: HTMLDivElement
    declare slotContainer: HTMLSlotElement
    declare text?: string
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
        this.shadowRoot!.appendChild(document.createElement('slot'))
    }
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (this.textContainer == null) {
            this.textContainer = document.createElement('div')
            // 注意这里不能加到 shadow
            this.appendChild(this.textContainer)
            this.textContainer.style.display = 'none'
        }
        this.textContainer.innerText = newValue || ''
    }
}

customElements.define('inner-text-container', InnerTextContainerElement)
