import { Dialog } from 'mdui'
import * as React from 'react'
import RouterDialogsContext from './RouterDialogsContext'
import { BlockerFunction, useBlocker, useNavigate } from "react-router"
import sleep from "../../utils/sleep"

const routerDialogsList = []

export default function RouterDialogsContextWrapper({ children }: React.HTMLAttributes<HTMLElement>) {
    const proceedRef = React.useRef<() => void>()
    const nav = useNavigate()
    // 进入子路由不会拦截上一个路由对话框的关闭
    // 没有路由对话框不会拦截
    const blocker = useBlocker(React.useCallback<BlockerFunction>(({ nextLocation, currentLocation }) => {
          // 只有当有对话框时，才检查路由变化
          if (routerDialogsList.length === 0) {
              return false // 没有对话框，允许所有导航
          }
          
          // 检查是否是同一个路由
          if (nextLocation.pathname === currentLocation.pathname) {
              return false // 相同路由，允许
          }
          
          // 检查是否是子路由
          if (nextLocation.pathname.startsWith(currentLocation.pathname + '/')) {
              return false // 是子路由，允许
          }
          
          // 其他情况：阻止导航
          return true
      }, []))

    // 避免用户手动返回导致动画丢失
    React.useEffect(() => {
        if (blocker.state === "blocked") {
            console.log(location)
            console.log(routerDialogsList[routerDialogsList.length - 1].current)
            console.log(blocker)
            proceedRef.current = blocker.proceed
            // 这个让姐姐来就好啦
            routerDialogsList.length != 0 && (routerDialogsList[routerDialogsList.length - 1].current!.open = false)
        }
    }, [blocker.state])

    // 注册
    // 理应在 Effect 里
    function registerRouterDialog(ref: React.MutableRefObject<Dialog>) {
        routerDialogsList.push(ref)
        // 正常情况下不可能同时关掉两个对话框
        // 不过要是真有的话, 再说吧
        ref.current!.addEventListener('closed', async () => {
            routerDialogsList.splice(routerDialogsList.length - 1, 1)
            await sleep(10)
            proceedRef.current ? proceedRef.current() : nav(-1)
        })
    }

    return <RouterDialogsContext.Provider value={registerRouterDialog}>
        { children }
    </RouterDialogsContext.Provider>
}
