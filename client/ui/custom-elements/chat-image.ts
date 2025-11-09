import openImageViewer from "../openImageViewer.ts"

import { $ } from 'mdui/jq'


customElements.define('chat-image', class extends HTMLElement {
    static observedAttributes = ['src', 'show-error']
    declare img: HTMLImageElement
    declare error: HTMLElement
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
    }
    update() {
        if (this.img == null) return

        this.img.src = $(this).attr('src') as string

        const error = $(this).attr('show-error') == 'true'
        this.img.style.display = error ? 'none' : 'block'
        this.error.style.display = error ? '' : 'none'
    }
    attributeChangedCallback(_name: string, _oldValue: unknown, _newValue: unknown) {
        this.update()
    }
    connectedCallback() {
        this.img = new Image()
        this.img.style.width = '100%'
        this.img.style.maxHeight = "300px"
        this.img.style.objectFit = 'cover'
        // this.img.style.borderRadius = "var(--mdui-shape-corner-medium)"
        this.shadowRoot!.appendChild(this.img)

        this.error = new DOMParser().parseFromString(`<mdui-icon name="broken_image" style="font-size: 2rem;"></mdui-icon>`, 'text/html').body.firstChild as HTMLElement
        this.shadowRoot!.appendChild(this.error)

        this.img.addEventListener('error', () => {
            $(this).attr('show-error', 'true')
        })
        this.error.addEventListener('click', (event) => {
            event.stopPropagation()
            const img = this.img
            this.img = new Image()
            this.img.style.width = '100%'
            this.img.style.maxHeight = "300px"
            this.img.style.objectFit = 'cover'
            this.shadowRoot!.replaceChild(img, this.img)
            $(this).attr('show-error', undefined)
        })
        this.img.addEventListener('click', (event) => {
            event.stopPropagation()
            openImageViewer($(this).attr('src') as string)
        })

        this.update()
    }
})

document.body.appendChild(new DOMParser().parseFromString(`
    <mdui-dialog id="image-viewer-dialog" fullscreen="fullscreen">
        <style>
            #image-viewer-dialog::part(panel) {
                background: rgba(0, 0, 0, 0) !important;
                padding: 0 !important;
            }
    
            #image-viewer-dialog>mdui-button-icon[icon=close] {
                z-index: 114514;
                position: fixed;
                top: 15px;
                right: 15px;
                color: #ffffff
            }
    
            #image-viewer-dialog>mdui-button-icon[icon=open_in_new] {
                z-index: 114514;
                position: fixed;
                top: 15px;
                right: 65px;
                color: #ffffff
            }
        </style>
        <mdui-button-icon icon="open_in_new"
            onclick="window.open(document.querySelector('#image-viewer-dialog-inner > *').src, '_blank')">
        </mdui-button-icon>
        <mdui-button-icon icon="close" onclick="this.parentNode.open = false">
        </mdui-button-icon>
        <pinch-zoom id="image-viewer-dialog-inner" style="width: var(--whitesilk-window-width); height: var(--whitesilk-window-height);">
        </pinch-zoom>
    </mdui-dialog>
`, 'text/html').body.firstChild as Node)
