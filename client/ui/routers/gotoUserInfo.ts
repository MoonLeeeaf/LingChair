import { NavigateFunction } from "react-router"

export default function gotoUserInfo(nav: NavigateFunction, id: string) {
    nav('/info/user?id=' + id)
}
