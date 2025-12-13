import { NavigateFunction } from "react-router"

export default function gotoChatInfo(nav: NavigateFunction, id: string) {
    nav('/info/chat?id=' + id)
}
