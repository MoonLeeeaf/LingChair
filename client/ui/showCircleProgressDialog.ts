import { $, dialog } from 'mdui'

export default function showCircleProgressDialog(text: string) {
    const d = dialog({
        body: `
            <div style="display: flex; align-items: center;">
                <mdui-circular-progress style="margin-left: 3px"></mdui-circular-progress>
                <span style="margin-left: 20px;"></span>
            </div>
        `,
        closeOnEsc: false,
        closeOnOverlayClick: false,
    })
    $(d).addClass('waiting-dialog').find('span').text(text)
    $(d.shadowRoot).append(`
        <style>
            .body {
                overflow: hidden !important;
            }  
        </style>
    `)
    return d
}
