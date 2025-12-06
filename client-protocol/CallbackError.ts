import ApiCallbackMessage from "./ApiCallbackMessage.ts"

export default class CallbackError extends Error {
    declare code: number
    declare data?: object
    constructor(re: ApiCallbackMessage) {
        super(`[${re.code}] ${re.msg}${re.data ? ` (data: ${JSON.stringify(re.data)})` : ''}`)
        this.code = re.code
        this.data = re.data
    }
}