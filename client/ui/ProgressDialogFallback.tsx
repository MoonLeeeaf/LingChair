import EffectOnly from "./EffectOnly"
import showCircleProgressDialog from "./showCircleProgressDialog"

export default function ProgressDialogFallback({ text }: { text: string }) {
    return <EffectOnly effect={() => {
        const wait = showCircleProgressDialog(text)
        return () => {
            wait.open = false
        }
    }} deps={[]} />
}
