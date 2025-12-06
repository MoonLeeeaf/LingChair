import data from "./Data.ts";
import getClient from "./getClient.ts"

/** 
 * 尝试进行验证
 * 
 * 成功后自动保存到本地
 * 
 * 优先级: 账号密码 > 提供刷新令牌 > 储存的刷新令牌
 * 
 * 不会逐一尝试
 */
export default async function performAuth(args: {
    refresh_token?: string
    account?: string
    password?: string
}) {
    if (args.account && args.password)
        await getClient().authOrThrow({
            account: args.account,
            password: args.password,
        })
    else {
        await getClient().authOrThrow({ refresh_token: args.refresh_token ? args.refresh_token : data.refresh_token })
    }
    data.refresh_token = getClient().getCachedRefreshToken()
    data.access_token = getClient().getCachedAccessToken()
    data.apply()
}
