import LingChairClient, { User, UserMySelf } from "./LingChairClient.ts"
import OnMessageData from "./type/OnMessageData.ts"

const client = new LingChairClient({
    server_url: 'ws://localhost:3601',
    device_id: 'test01'
})
await client.auth({
    account: '满月',
    password: '满月',
})
client.on('Client.onMessage', (data: OnMessageData) => {
    console.log(data)
})
console.log(await (await UserMySelf.getMySelf(client))?.getMyRecentChatBeans())
