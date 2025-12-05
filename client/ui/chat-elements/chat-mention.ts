import { $ } from 'mdui'
import showSnackbar from "../../utils/showSnackbar.ts";
customElements.define('chat-mention', class extends HTMLElement {
    declare link: HTMLAnchorElement
    static observedAttributes = ['user-id']
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
        const shadow = this.shadowRoot as ShadowRoot

        this.link = document.createElement('a')
        this.link.style.fontSynthesis = 'style weight'
        this.link.style.color = 'rgb(var(--mdui-color-primary))'
        this.link.href = 'javascript:void(0)'
        shadow.appendChild(this.link)

        this.update()
    }
    attributeChangedCallback(_name: string, _oldValue: unknown, _newValue: unknown) {
        this.update()
    }
    async update() {
        if (this.link == null) return

        const userId = $(this).attr('user-id')
        const chatId = $(this).attr('chat-id')
        const text = $(this).attr('text')
        this.link.style.fontStyle = ''
        if (chatId) {
            
            this.link.onclick = (e) => {
                e.stopPropagation()
                // deno-lint-ignore no-window
                
            }
        } else if (userId) {
           
            this.link.onclick = (e) => {
                e.stopPropagation()
                // deno-lint-ignore no-window
                
            }
        }
        
        text && (this.link.textContent = text)
        if (!(userId || chatId)) {
            this.link.textContent = "无效的提及"
            this.link.style.fontStyle = 'italic'
            this.link.onclick = (e) => {
                e.stopPropagation()
                showSnackbar({
                    message: "该提及没有指定用户或者对话！",
                })
            }
        }
    }
})
