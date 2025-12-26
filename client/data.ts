import crypto from 'node:crypto'

const dataIsEmpty = !localStorage.tws_data || localStorage.tws_data == ''

class Aes {
    static randomIv() {
        return crypto.randomBytes(12)
    }
    static normalizeKey(key: string, keyLength = 32) {
        const hash = crypto.createHash('sha256')
        hash.update(key)
        const keyBuffer = hash.digest()
        return keyLength ? keyBuffer.subarray(0, keyLength) : keyBuffer
    }
    static encrypt(data: string, key: string) {
        const iv = this.randomIv()
        return Buffer.concat([iv, crypto.createCipheriv("aes-256-gcm", this.normalizeKey(key), iv).update(data)]).toString('hex')
    }
    static decrypt(data: string, key: string) {
        const buffer = Buffer.from(data, 'hex')
        const iv = buffer.subarray(0, 12)
        return crypto.createDecipheriv("aes-256-gcm", this.normalizeKey(key), iv).update(buffer.subarray(12)).toString()
    }
}

// 尽可能防止被窃取, 虽然理论上还是会被窃取
const key = crypto.createHash('sha256').update(location.host + '_TWS_姐姐_' + navigator.userAgent).digest().toString('base64')

if (dataIsEmpty) localStorage.tws_data = Aes.encrypt('{}', key)

let _data_cached
try {
    _data_cached = JSON.parse(Aes.decrypt(localStorage.tws_data, key))
} catch (e) {
    console.warn("数据解密失败, 使用空数据...", e)
    _data_cached = {}
}

type IData = {
    refresh_token?: string
    split_sizes: number[]
    apply(): void
    access_token?: string
    device_id: string
    override_use_mobile_ui?: boolean
}

declare global {
    interface Window {
        data?: IData
    }
}

const data = new Proxy({} as IData, {
    get(_obj, k) {
        if (k == '_cached') return _data_cached
        if (k == 'apply') return () => localStorage.tws_data = Aes.encrypt(JSON.stringify(_data_cached), key)
        return _data_cached[k]
    },
    set(_obj, k, v) {
        if (k == '_cached') return false
        _data_cached[k] = v
        return true
    }
})

if (new URL(location.href).searchParams.get('export_data') == 'true') {
    window.data = data
    console.warn("警告: 将 data 暴露到 window 有可能会导致令牌泄露!")
}

export default data
