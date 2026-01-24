import * as React from 'react'

export default function useEffectRef<T = undefined>(effect: (ref: React.MutableRefObject<T | undefined>) => void | (() => void), deps?: React.DependencyList) {
    const ref = React.useRef<T>()
    React.useEffect(() => {
        return effect(ref)
    }, deps)
    return ref
}
