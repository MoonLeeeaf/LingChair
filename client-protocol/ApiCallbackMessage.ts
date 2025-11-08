type ApiCallbackMessage = {
    msg: string,
    /**
     * 200: 成功
     * 400: 伺服器端無法理解客戶端請求
     * 401: 需要身份驗證
     * 403: 伺服器端拒絕執行客戶端請求
     * 404: Not Found
     * 500: 伺服器端錯誤
     * 501: 伺服器端不支持請求的功能
     */
    code: 200 | 400 | 401 | 403 | 404 | 500 | 501 | -1,
    data?: { [key: string]: unknown },
}
export default ApiCallbackMessage
