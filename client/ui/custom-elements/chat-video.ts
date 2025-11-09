import { $ } from 'mdui/jq'

customElements.define('chat-video', class extends HTMLElement {
    static observedAttributes = ['src']
    declare video: HTMLVideoElement
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
    }
    update() {
        if (this.video == null) return

        this.video.src = $(this).attr('src') as string
    }
    attributeChangedCallback(_name: string, _oldValue: unknown, _newValue: unknown) {
        this.update()
    }
    connectedCallback() {
        this.video = new DOMParser().parseFromString(`<video controls></video>`, 'text/html').body.firstChild as HTMLVideoElement
        this.video.style.maxWidth = "400px"
        this.video.style.maxHeight = "300px"
        this.video.style.width = "100%"
        this.video.style.height = "100%"
        this.video.style.display = 'block'
        // e.style.borderRadius = "var(--mdui-shape-corner-medium)"
       
        this.video.onclick = (e) => e.stopPropagation()
        this.shadowRoot!.appendChild(this.video)
    }
})
