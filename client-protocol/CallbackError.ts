import ApiCallbackMessage from "./ApiCallbackMessage.ts"

export default class CallbackError extends Error {
    constructor(re: ApiCallbackMessage) {
        super(`[${re.code}] ${re.msg}${re.data ? ` (data: ${JSON.stringify(re.data)})` : ''}`)
    }
}