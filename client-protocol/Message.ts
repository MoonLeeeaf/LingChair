import BaseClientObject from "./BaseClientObject.ts"
import MessageBean from "./bean/MessageBean.ts"
import LingChairClient from "./LingChairClient.ts"
import Chat from "./Chat.ts"
import User from "./User.ts"
import CallbackError from "./CallbackError.ts"
import ApiCallbackMessage from "./ApiCallbackMessage.ts"

import * as marked from 'marked'

export class ChatMention extends BaseClientObject {
    declare chat_id?: string
    declare user_id?: string
    declare text?: string
    constructor(client: LingChairClient, {
        user_id,
        chat_id,
        text,
    }: {
        user_id?: string,
        chat_id?: string,
        text: string,
    }) {
        super(client)
        this.user_id = user_id
        this.chat_id = chat_id
        this.text = text
    }
    async getChat() {
        return await Chat.getById(this.client, this.chat_id as string)
    }
    async getUser() {
        return await User.getById(this.client, this.user_id as string)
    }
    getText() {
        return this.text
    }
}

type FileType = 'Video' | 'Image' | 'File'
type MentionType = 'ChatMention' | 'UserMention'

export class ChatAttachment extends BaseClientObject {
    declare file_hash: string
    declare file_name: string
    constructor(client: LingChairClient, {
        file_hash,
        file_name
    }: {
        file_hash: string,
        file_name: string
    }) {
        super(client)
        this.file_name = file_name
        this.file_hash = file_hash
    }
    async blob() {
        try {
            return await this.blobOrThrow()
        } catch (_) {
            return null
        }
    }
    fetch(init?: RequestInit) {
        const url = this.client.getUrlForFileByHash(this.file_hash)
        return fetch(url!, init)
    }
    async blobOrThrow() {
        const re = await this.fetch()
        const blob = await re.blob()
        if (!re.ok) throw new CallbackError({
            msg: await blob.text(),
            code: re.status,
        } as ApiCallbackMessage)
        return blob
    }
    async getMimeType() {
        try {
            return await this.getMimeTypeOrThrow()
        } catch (_) {
            return null
        }
    }
    async getMimeTypeOrThrow() {
        const re = await this.fetch({
            method: 'HEAD'
        })
        if (re.ok) {
            const t = re.headers.get('content-type')
            if (t)
                return t
            throw new Error("Unable to get Content-Type")
        }
        throw new CallbackError({
            msg: await re.text(),
            code: re.status,
        } as ApiCallbackMessage)
    }
    async getLength() {
        try {
            return await this.getLengthOrThrow()
        } catch (_) {
            return null
        }
    }
    async getLengthOrThrow() {
        const re = await this.fetch({
            method: 'HEAD'
        })
        if (re.ok) {
            const contentLength = re.headers.get('content-length')
            if (contentLength)
                return parseInt(contentLength)
            throw new Error("Unable to get Content-Length")
        }
        throw new CallbackError({
            msg: await re.text(),
            code: re.status,
        } as ApiCallbackMessage)
    }
    getFileHash() {
        return this.file_hash
    }
    getFileName() {
        return this.file_name
    }
}

export default class Message extends BaseClientObject {
    declare bean: MessageBean
    constructor(client: LingChairClient, bean: MessageBean) {
        super(client)
        this.bean = bean
    }
    /*
     * ================================================
     *                    基本 Bean
     * ================================================
     */
    getId() {
        return this.bean.id
    }
    getChatId() {
        return this.bean.chat_id
    }
    async getChat() {
        return await Chat.getById(this.client, this.bean.chat_id as string)
    }
    getText() {
        return this.bean.text
    }
    parseWithTransformers({
        attachment,
        mention,
    }: {
        attachment?: ({ text, fileType, attachment }: { text: string, fileType: FileType, attachment: ChatAttachment }) => string,
        mention?: ({ text, mentionType, mention }: { text: string, mentionType: MentionType, mention: ChatMention }) => string,
    }) {
        return new marked.Marked({
            async: false,
            extensions: [
                {
                    name: 'text',
                    renderer: ({ text }) => text,
                },
                {
                    name: 'heading',
                    renderer({ tokens }) {
                        return this.parser.parseInline(tokens!)
                    },
                },
                {
                    name: 'paragraph',
                    renderer({ tokens }) {
                        return this.parser.parseInline(tokens!)
                    },
                },
                {
                    name: 'image',
                    renderer: ({ text, href }) => {
                        const mentionType = /^(UserMention|ChatMention)=.*/.exec(text)?.[1] as MentionType
                        const fileType = (/^(Video|File|Image)=.*/.exec(text)?.[1] || 'Image') as FileType

                        if (fileType != null && /tws:\/\/file\?hash=[A-Za-z0-9]+$/.test(href)) {
                            const file_hash = /^tws:\/\/file\?hash=(.*)/.exec(href)?.[1]!
                            let file_name: string = /^(Video|File|Image)=(.*)/.exec(text)?.[2] || text
                            file_name.trim() == '' && (file_name = 'Unnamed_File')
                            return attachment ? attachment({ text: text, attachment: new ChatAttachment(this.client, { file_hash, file_name }), fileType: fileType, }) : text
                        }
                        if (mentionType != null && /^tws:\/\/chat\?id=[A-Za-z0-9]+/.test(href)) {
                            const id = /^tws:\/\/chat\?id=(.*)/.exec(href)?.[1]!
                            const label = /^(User|Chat)Mention=(.*)/.exec(text)?.[2] || ''
                            return mention ? mention({
                                text: text,
                                mention: new ChatMention(this.client, {
                                    [({
                                        ChatMention: 'chat_id',
                                        UserMention: 'user_id',
                                    })[mentionType]]: id,
                                    text: label,
                                }),
                                mentionType: mentionType,
                            }) : text
                        }
                    },
                }
            ]
        }).parse(this.getText()) as string
    }
    getAttachments() {
        const attachments: ChatAttachment[] = []
        this.parseWithTransformers({
            attachment({ attachment }) {
                attachments.push(attachment)
                return ''
            }
        })
        return attachments
    }
    getMentions() {
        const mentions: ChatMention[] = []
        this.parseWithTransformers({
            mention({ mention }) {
                mentions.push(mention)
                return ''
            }
        })
        return mentions
    }
    getUserId() {
        return this.bean.user_id
    }
    async getUser() {
        return await User.getById(this.client, this.bean.user_id as string)
    }
    getTime() {
        return this.bean.time
    }
}