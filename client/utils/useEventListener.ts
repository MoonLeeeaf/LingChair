import * as React from 'react'

export default function useEventListener<T extends HTMLElement | undefined | null>(ref: React.MutableRefObject<T>, eventName: string, callback: (event: Event) => void) {
	// console.error(ref, eventName, callback)
    React.useEffect(() => {
    	// console.warn(ref, eventName, callback)
        ref.current!.addEventListener(eventName, callback)
        return () => ref.current?.removeEventListener(eventName, callback)
    }, [ref, eventName, callback])
}
