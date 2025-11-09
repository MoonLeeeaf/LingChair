import { $ } from 'mdui/jq'

customElements.define('chat-file', class extends HTMLElement {
    constructor() {
        super()
    }
    connectedCallback() {
        const e = new DOMParser().parseFromString(`
        <a style="width: 100%;height: 100%;">
            <mdui-card clickable style="display: flex;align-items: center;box-shadow: inherit;border-radius: inherit;">
                <mdui-icon name="insert_drive_file" style="margin: 13px;font-size: 34px;"></mdui-icon>
                <span style="margin-right: 13px; word-wrap: break-word; word-break:break-all;white-space:normal; max-width :100%;"></span>
            </mdui-card>
        </a>`, 'text/html').body.firstChild as HTMLElement
        $(e).find('span').text($(this).attr("name"))
        const href = $(this).attr('href')
        $(e).attr('href', href)
        $(e).attr('target', '_blank')
        $(e).attr('download', href)
        e.style.textDecoration = 'none'
        e.style.color = 'inherit'
        e.onclick = (e) => {
            e.stopPropagation()
        }
        this.appendChild(e)
    }
})
