import LingChairClient, { Chat, UserMySelf } from "./LingChairClient.ts"
import OnMessageData from "./type/OnMessageData.ts"

const client = new LingChairClient({
    server_url: 'ws://localhost:3601',
    device_id: 'test01'
})
await client.auth({
    account: '满月',
    password: '满月',
})
client.on('Client.onMessage', async (data: OnMessageData) => {
    const chat = await Chat.getById(client, data.chat)
    const regexp = /^test (.*)/g.exec(data.msg.text)
    if (regexp?.[0] != null) {
        chat?.sendMessage(`Hello, ${regexp[1]}`)
    }
})
