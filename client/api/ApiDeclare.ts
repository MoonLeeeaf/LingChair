export type CallMethod = 
    // 用户验证
    "User.auth" |
    "User.register" |
    "User.login" |
    "User.refreshAccessToken" |

    // 账号
    "User.setAvatar" |
    "User.updateProfile" |
    "User.getMyInfo" |
    "User.resetPassword" |

    // 用户资料
    "User.getInfo" |

    // 收藏对话列表
    "User.getMyContacts" |
    "User.addContacts" |
    "User.removeContacts" |

    // 最近对话列表
    "User.getMyRecentChats" | 

    // 对话信息
    "Chat.getInfo" |
    "Chat.getAnotherUserIdFromPrivate" |
    "Chat.getMembers" | 
    
    // 对话设置
    "Chat.updateSettings" |
    "Chat.setAvatar" |

    // 对话创建
    "Chat.createGroup" |
    "Chat.getIdForPrivate" |

    // 入群请求
    "Chat.processJoinRequest" |
    "Chat.sendJoinRequest" |
    "Chat.getJoinRequests" |

    // 对话消息
    "Chat.sendMessage" |
    "Chat.getMessageHistory"

    // (废弃) 文件上传
    // "Chat.uploadFile"

export type ClientEvent = 
    // 对话收消息
    "Client.onMessage"

export const CallableMethodBeforeAuth = [
    "User.auth",
    "User.register",
    "User.login",
    "User.refreshAccessToken",
]