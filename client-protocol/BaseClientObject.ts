import LingChairClient from "./LingChairClient.ts"

export default class BaseClientObject {
    declare client: LingChairClient
    constructor(client: LingChairClient) {
        this.client = client
    }
}