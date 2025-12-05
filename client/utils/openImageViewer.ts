import { $ } from 'mdui/jq'
import 'pinch-zoom-element'

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

export default function openImageViewer(src: string) {
    $('#image-viewer-dialog-inner').empty()

    const e = new Image()
    e.onload = () => ($('#image-viewer-dialog-inner').get(0) as any).scaleTo(0.1, {
        // Transform origin. Can be a number, or string percent, eg "50%"
        originX: '50%',
        originY: '50%',
        // Should the transform origin be relative to the container, or content?
        relativeTo: 'container',
    })
    e.src = src
    $('#image-viewer-dialog-inner').append(e)
    $('#image-viewer-dialog').attr('open', 'true')
}
