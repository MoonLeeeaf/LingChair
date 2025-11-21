import { $ } from 'mdui'
import DataCaches from "../../api/DataCaches.ts"
import { snackbar } from "../snackbar.ts"

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
            const chat = await DataCaches.getChatInfo(chatId)
            this.link.textContent = chat?.title
            this.link.onclick = () => {
                // deno-lint-ignore no-window
                window.openChatInfoDialog(chat)
            }
        } else if (userId) {
            const user = await DataCaches.getUserProfile(userId)
            this.link.textContent = user?.nickname
            this.link.onclick = () => {
                // deno-lint-ignore no-window
                window.openUserInfoDialog(user)
            }
        }
        
        text && (this.link.textContent = text)
        if (!(userId || chatId)) {
            this.link.textContent = "无效的提及"
            this.link.style.fontStyle = 'italic'
            this.link.onclick = () => {
                snackbar({
                    message: "该提及没有指定用户或者对话！",
                    placement: 'top',
                })
            }
        }
    }
})
