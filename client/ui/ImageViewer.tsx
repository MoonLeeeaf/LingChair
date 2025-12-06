import { Dialog } from 'mdui'
import 'pinch-zoom-element'
import React from "react"

export default function ImageViewer() {
    const dialogRef = React.useRef<Dialog>()
    
    return <mdui-dialog ref={dialogRef} fullscreen="fullscreen">
        <mdui-button-icon icon="open_in_new"
            onclick="window.open(document.querySelector('#image-viewer-dialog-inner > *').src, '_blank')">
        </mdui-button-icon>
        <mdui-button-icon icon="close" onClick={() => dialogRef.current!.open = false}>
        </mdui-button-icon>
        {
            // @ts-ignore 注册了这个元素
            <pinch-zoom id="image-viewer-dialog-inner" style="width: var(--whitesilk-window-width); height: var(--whitesilk-window-height);"></pinch-zoom>
        }
    </mdui-dialog>
}
