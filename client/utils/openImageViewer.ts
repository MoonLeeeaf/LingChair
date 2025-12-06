import { $ } from 'mdui/jq'

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
