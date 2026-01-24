import EffectOnly from "./EffectOnly.tsx"
import showCircleProgressDialog from "./showCircleProgressDialog.ts"

export default function ProgressDialogFallback({ text }: { text: string }) {
    return <EffectOnly effect={() => {
        const wait = showCircleProgressDialog(text)
        return () => {
            wait.open = false
        }
    }} deps={[]} />
}
