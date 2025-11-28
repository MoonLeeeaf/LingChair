import BaseClientObject from "./BaseClientObject.ts"
import MessageBean from "./bean/MessageBean.ts"
import LingChairClient from "./LingChairClient.ts"
import Chat from "./Chat.ts"
import User from "./User.ts"
import CallbackError from "./CallbackError.ts"
import ApiCallbackMessage from "./ApiCallbackMessage.ts"

import marked from 'marked'

class ChatMention extends BaseClientObject {
    declare chat_id?: string
    declare user_id?: string
    constructor(client: LingChairClient, {
        user_id,
        chat_id,
    }: {
        user_id?: string,
        chat_id?: string,
    }) {
        super(client)
        this.user_id = user_id
        this.chat_id = chat_id
    }
    async getChat() {
        return await Chat.getById(this.client, this.chat_id as string)
    }
    async getUser() {
        return await User.getById(this.client, this.user_id as string)
    }
}

type FileType = 'Video' | 'Image' | 'File'
type MentionType = 'ChatMention' | 'UserMention'

class ChatAttachment extends BaseClientObject {
    declare file_hash: string
    constructor(client: LingChairClient, file_hash: string) {
        super(client)
        this.file_hash = file_hash
    }
    async blob() {
        try {
            return await this.blobOrThrow()
        } catch (_) {
            return null
        }
    }
    async blobOrThrow() {
        const url = this.client.getUrlForFileByHash(this.file_hash)
        const re = await fetch(url!)
        const blob = await re.blob()
        if (!re.ok) throw new CallbackError({
            msg: await blob.text(),
            code: re.status,
        } as ApiCallbackMessage)
        return blob
    }
    getFileHash() {
        return this.file_hash
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
        new marked.Marked({
            extensions: [
                {
                    name: 'image',
                    renderer: ({ text, href }) => {
                        const mentionType = /^(UserMention|ChatMention)=.*/.exec(text)?.[1] as MentionType
                        const fileType = (/^(Video|File|Image)=.*/.exec(text)?.[1] || 'Image') as FileType

                        if (fileType != null && /tws:\/\/file\?hash=[A-Za-z0-9]+$/.test(href)) {
                            const file_hash = /^tws:\/\/file\?hash=(.*)/.exec(href)?.[1]!
                            return attachment ? attachment({ text: text, attachment: new ChatAttachment(this.client, file_hash), fileType: fileType, }) : text
                        }
                        if (mentionType != null && /^tws:\/\/chat\?id=[A-Za-z0-9]+/.test(href)) {
                            const id = /^tws:\/\/chat\?id=(.*)/.exec(href)?.[1]!
                            return mention ? mention({
                                text: text,
                                mention: new ChatMention(this.client, {
                                    [({
                                        ChatMention: 'chat_id',
                                        UserMention: 'user_id',
                                    })[mentionType]]: id
                                }),
                                mentionType: mentionType,
                            }) : text
                        }
                    },
                }
            ]
        }).parse(this.getText())
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