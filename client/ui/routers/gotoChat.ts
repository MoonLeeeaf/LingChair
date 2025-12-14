import { NavigateFunction } from "react-router"

export default async function gotoChat({ nav, setter, id }: { nav?: NavigateFunction, setter?: (id: string) => void, id: string }) {
    await nav?.('/chat?id=' + id)
    setter?.(id)
}
