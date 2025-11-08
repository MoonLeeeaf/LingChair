export type CallMethod = 
    "User.auth" |
    "User.register" |
    "User.login" |
    "User.refreshAccessToken" |

    "User.setAvatar" |
    "User.updateProfile" |
    "User.getMyInfo" |
    "User.resetPassword" |

    "User.getInfo" |

    "User.getMyContacts" |
    "User.addContacts" |
    "User.removeContacts" |

    "User.getMyRecentChats" | 

    "Chat.getInfo" |
    
    "Chat.updateSettings" |
    "Chat.setAvatar" |

    "Chat.createGroup" |

    "Chat.getIdForPrivate" |
    "Chat.getAnotherUserIdFromPrivate" |

    "Chat.processJoinRequest" |
    "Chat.sendJoinRequest" |
    "Chat.getJoinRequests" |

    "Chat.sendMessage" |
    "Chat.getMessageHistory" |

    "Chat.uploadFile"

export type ClientEvent = 
    "Client.onMessage"

export const CallableMethodBeforeAuth = [
    "User.auth",
    "User.register",
    "User.login",
    "User.refreshAccessToken",
]