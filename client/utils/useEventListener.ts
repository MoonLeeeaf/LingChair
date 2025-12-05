import * as React from 'react'

export default function useEventListener<T extends HTMLElement | null>(ref: React.MutableRefObject<T>, eventName: string, callback: (event: Event) => void) {
    React.useEffect(() => {
        ref.current!.addEventListener(eventName, callback)
        return () => ref.current?.removeEventListener(eventName, callback)
    }, [ref, eventName, callback])
}
