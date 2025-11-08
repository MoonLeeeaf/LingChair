interface GroupSettingsBean {
    allow_new_member_join?: boolean
    allow_new_member_from_invitation?: boolean
    new_member_join_method?: 'disabled' | 'allowed_by_admin' | 'answered_and_allowed_by_admin'
    answered_and_allowed_by_admin_question?: string

    // 下面两个比较特殊, 由服务端给予
    group_title: string
    group_name: string

    [key: string]: unknown
}

export default GroupSettingsBean
