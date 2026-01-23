import { ApiCallbackMessage } from 'lingchair-internal-shared'
import BaseClientObject from './BaseClientObject.ts'
import CallbackError from './CallbackError.ts'
import LingChairClient from './LingChairClient.ts'

export default class ChatAttachment extends BaseClientObject {
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