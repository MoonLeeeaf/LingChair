import * as React from 'react'

export default function EffectOnly({ effect, deps }: { effect: React.EffectCallback, deps?: React.DependencyList }) {
    React.useEffect(effect, deps)
    return null
}
