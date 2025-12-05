import React from "react"

export default function useAsyncEffect(func: Function, deps?: React.DependencyList) {
    React.useEffect(() => {
        func()
        // 警告: 不添加 deps 有可能導致無限執行
    }, deps || [])
}
