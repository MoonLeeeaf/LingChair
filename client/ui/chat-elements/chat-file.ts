import { $ } from 'mdui/jq'

customElements.define('chat-file', class extends HTMLElement {
    static observedAttributes = ['href', 'name']
    declare anchor: HTMLAnchorElement
    declare span: HTMLSpanElement
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }
    update() {
        if (this.anchor == null) return

        this.anchor.href = $(this).attr('href') as string
        this.anchor.download = $(this).attr('href') as string
        this.span.textContent = $(this).attr("name") as string
    }
    attributeChangedCallback(_name: string, _oldValue: unknown, _newValue: unknown) {
        this.update()
    }
    connectedCallback() {
        this.anchor = new DOMParser().parseFromString(`
        <a style="width: 100%;height: 100%;">
            <mdui-card clickable style="display: flex;align-items: center;box-shadow: inherit;border-radius: inherit;">
                <mdui-icon name="insert_drive_file" style="margin: 13px;font-size: 34px;"></mdui-icon>
                <span style="margin-right: 13px; word-wrap: break-word; word-break:break-all;white-space:normal; max-width :100%;"></span>
            </mdui-card>
        </a>`, 'text/html').body.firstChild as HTMLAnchorElement
        this.span = $(this.anchor).find('span').get(0)
        this.anchor.style.textDecoration = 'none'
        this.anchor.style.color = 'inherit'
        this.anchor.onclick = (e) => {
            e.stopPropagation()
        }
        this.shadowRoot!.appendChild(this.anchor)

        this.update()
    }
})
