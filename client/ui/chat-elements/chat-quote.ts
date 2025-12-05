import { $ } from 'mdui/jq'

customElements.define('chat-quote', class extends HTMLElement {
    declare container: HTMLAnchorElement
    declare span: HTMLSpanElement
    declare ellipsis: boolean
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }
    update() {
        if (this.container == null) return

        this.span.textContent = this.textContent

        this.updateStyle()
    }
    updateStyle() {
        this.span.style.whiteSpace = this.ellipsis ? 'nowrap' : 'pre-wrap'
        this.span.style.overflow = this.ellipsis ? 'hidden' : ''
        this.span.style.textOverflow = this.ellipsis ? 'ellipsis' : ''
    }
    attributeChangedCallback(_name: string, _oldValue: unknown, _newValue: unknown) {
        this.update()
    }
    connectedCallback() {
        this.container = new DOMParser().parseFromString(`
        <a style="width: 100%;height: 100%; color: rgb(var(--mdui-color-primary));" href="javascript:void(0)">
            <span style="display: block; word-wrap: break-word; word-break:break-all;white-space:normal; max-width :100%;"></span>
        </a>`, 'text/html').body.firstChild as HTMLAnchorElement
        this.span = $(this.container).find('span').get(0)
        this.container.style.textDecoration = 'none'
        this.span.style.fontSynthesis = 'style weight'
        this.container.onclick = (e) => {
            this.ellipsis = !this.ellipsis
            this.updateStyle()
            e.stopPropagation()
        }
        this.ellipsis = true

        this.shadowRoot!.appendChild(this.container)

        this.update()
    }
})
