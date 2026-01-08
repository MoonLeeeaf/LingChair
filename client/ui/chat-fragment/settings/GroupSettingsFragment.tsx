export default function GroupSettingsFragment() {
    /* chatInfo.getType() == 'group' && <PreferenceLayout>
                            <PreferenceUpdater.Provider value={groupPreferenceStore.createUpdater()}>
                                <PreferenceHeader
                                    title="群组资料" />
                                <Preference
                                    title="上传新的头像"
                                    icon="image"
                                    disabled={!chatInfo.isAdmin()}
                                    onClick={() => {
                                        uploadChatAvatarRef.current!.click()
                                    }} />
                                <TextFieldPreference
                                    title="设置群名称"
                                    icon="edit"
                                    id="group_title"
                                    state={groupPreferenceStore.state.group_title || ''}
                                    disabled={!chatInfo.isAdmin()} />
                                <TextFieldPreference
                                    title="设置群别名"
                                    icon="edit"
                                    id="group_name"
                                    description="以便于添加, 可留空"
                                    state={groupPreferenceStore.state.group_name || ''}
                                    disabled={!chatInfo.isAdmin()} />
                                <PreferenceHeader
                                    title="入群设定" />
                                <SwitchPreference
                                    title="允许入群"
                                    icon="person_add"
                                    id="allow_new_member_join"
                                    disabled={!chatInfo.isAdmin()}
                                    state={groupPreferenceStore.state.allow_new_member_join || false} />
                                <SwitchPreference
                                    title="允许成员邀请"
                                    description="目前压根没有这项功能, 甚至还不能查看成员列表, 以后再说吧"
                                    id="allow_new_member_from_invitation"
                                    icon="_"
                                    disabled={true || !chatInfo.isAdmin()}
                                    state={groupPreferenceStore.state.allow_new_member_from_invitation || false} />
                                <SelectPreference
                                    title="入群验证方式"
                                    icon="_"
                                    id="new_member_join_method"
                                    selections={{
                                        disabled: "无需验证",
                                        allowed_by_admin: "只需要管理员批准 (WIP)",
                                        answered_and_allowed_by_admin: "需要回答问题并获得管理员批准 (WIP)",
                                    }}
                                    disabled={!chatInfo.isAdmin() || !groupPreferenceStore.state.allow_new_member_join}
                                    state={groupPreferenceStore.state.new_member_join_method || 'disabled'} />
                                {
                                    groupPreferenceStore.state.new_member_join_method == 'answered_and_allowed_by_admin'
                                    && <TextFieldPreference
                                        title="设置问题"
                                        icon="_"
                                        id="answered_and_allowed_by_admin_question"
                                        description="WIP"
                                        state={groupPreferenceStore.state.answered_and_allowed_by_admin_question || ''}
                                        disabled={true || !chatInfo.isAdmin()} />
                                }
                            </PreferenceUpdater.Provider>
                        </PreferenceLayout> */
}
