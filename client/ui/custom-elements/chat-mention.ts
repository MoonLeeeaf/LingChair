import { $ } from 'mdui'
import DataCaches from "../../api/DataCaches.ts"
import { snackbar } from "../snackbar.ts"

customElements.define('chat-mention', class extends HTMLElement {
    declare span: HTMLSpanElement
    static observedAttributes = ['user-id']
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
        const shadow = this.shadowRoot as ShadowRoot

        this.span = document.createElement('span')
        this.span.style.fontSynthesis = 'style weight'
        this.span.style.color = 'rgb(var(--mdui-color-primary))'
        shadow.appendChild(this.span)

        this.update()
    }
    attributeChangedCallback(_name: string, _oldValue: unknown, _newValue: unknown) {
        this.update()
    }
    async update() {
        if (this.span == null) return

        const userId = $(this).attr('user-id')
        const chatId = $(this).attr('chat-id')
        const text = $(this).attr('text')
        this.span.style.fontStyle = ''
        if (chatId) {
            const chat = await DataCaches.getChatInfo(chatId)
            this.span.textContent = chat?.title
            this.span.onclick = () => {
                // deno-lint-ignore no-window
                window.openChatInfoDialog(chat)
            }
        } else if (userId) {
            const user = await DataCaches.getUserProfile(userId)
            this.span.textContent = user?.nickname
            this.span.onclick = () => {
                // deno-lint-ignore no-window
                window.openUserInfoDialog(user)
            }
        }
        
        text && (this.span.textContent = text)
        if (!(userId || chatId)) {
            this.span.textContent = "无效的提及"
            this.span.style.fontStyle = 'italic'
            this.span.onclick = () => {
                snackbar({
                    message: "该提及没有指定用户或者对话！",
                    placement: 'top',
                })
            }
        }
    }
})
