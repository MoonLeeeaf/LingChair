import React from 'react'

// deno-lint-ignore no-explicit-any
const PreferenceUpdater = React.createContext<(key: string, value: unknown) => void>(null as any)

export default PreferenceUpdater
