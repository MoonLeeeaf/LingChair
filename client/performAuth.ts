import data from "./data.ts"
import getClient from "./getClient.ts"

/** 
 * 进行身份验证以接受客户端事件
 * 
 * 使用验证方式优先级: 访问 > 刷新 > 账号密码
 * 
 * 若传递了账号密码, 则同时缓存新的访问令牌和刷新令牌
 * 
 * 如只传递两个令牌的其一, 按照优先级并在成功验证后赋值
 * 
 * 多个验证方式不会逐一尝试
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
        await getClient().authOrThrow({ refresh_token: args.refresh_token ? args.refresh_token : data.refresh_token, ignore_all_empty: true })
    }
    data.refresh_token = getClient().getCachedRefreshToken()
    data.access_token = getClient().getCachedAccessToken()
    data.apply()
}
