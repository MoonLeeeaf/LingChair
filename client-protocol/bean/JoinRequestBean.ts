export default class JoinRequestBean {
    declare user_id: string
    declare nickname: string
    declare avatar_file_hash?: string
    declare reason?: string

    [key: string]: unknown
}
