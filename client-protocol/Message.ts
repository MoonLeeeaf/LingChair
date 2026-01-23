import BaseClientObject from "./BaseClientObject.ts"
import MessageBean from "./bean/MessageBean.ts"
import LingChairClient from "./LingChairClient.ts"
import Chat from "./Chat.ts"
import User from "./User.ts"
import ChatAttachment from "./ChatAttachment.ts"

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

type ChatMentionType = 'ChatMention' | 'UserMention'
type ChatFileType = 'Video' | 'Image' | 'File'

type ChatParserTransformers = {
    attachment?: ({ text, fileType, attachment }: { text: string, fileType: ChatFileType, attachment: ChatAttachment }) => string,
    mention?: ({ text, mentionType, mention }: { text: string, mentionType: ChatMentionType, mention: ChatMention }) => string,
}

export type {
    ChatMentionType,
    ChatFileType,
    ChatParserTransformers,
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
    }: ChatParserTransformers) {
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
                        const mentionType = /^(UserMention|ChatMention)=.*/.exec(text)?.[1] as ChatMentionType
                        const fileType = (/^(Video|File|Image)=.*/.exec(text)?.[1] || 'Image') as ChatFileType

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