interface Args extends React.HTMLAttributes<HTMLElement> {
    src?: string
    text?: string
    icon?: string
    avatarRef?: React.LegacyRef<HTMLElement>
}

export default function Avatar({
    src,
    text,
    icon = 'person',
    avatarRef,
    ...props
}: Args) {
    if (src != null && src != '')
        return <mdui-avatar ref={avatarRef} {...props} src={src} />
    else if (text != null && text != '')
        return <mdui-avatar ref={avatarRef} {...props}>
            {
                text.substring(0, 1)
            }
        </mdui-avatar>
    else
        return <mdui-avatar icon={icon} ref={avatarRef} {...props} />
}
