import { LingChairClient } from 'lingchair-client-protocol'
import data from "./data.ts"
import { UAParser } from 'ua-parser-js'
import { randomUUID } from 'lingchair-internal-shared'

if (!data.device_id) {
    const ua = new UAParser(navigator.userAgent)
    data.device_id = `LingChair_Web_${ua.getOS() || 'unknown-os'}-${ua.getDevice().type || 'unknown_device'}-${randomUUID()}`
}
const client = new LingChairClient({
    server_url: '',
    device_id: data.device_id,
    auto_fresh_token: true,
})

export default function getClient() {
    return client
}
