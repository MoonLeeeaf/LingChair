export default function escapeHTML(str: string) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
}