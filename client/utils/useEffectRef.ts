import * as React from 'react'

export default function useEffectRef<T = undefined>(effect: (ref: React.MutableRefObject<T | undefined | null>) => void | (() => void), deps?: React.DependencyList) {
    const ref = React.useRef<T>(null)
    React.useEffect(() => {
        return effect(ref)
    }, deps)
    return ref
}
