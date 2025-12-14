export default function PreferenceLayout({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
    return <mdui-list style={{
        marginLeft: '15px',
        marginRight: '15px',
    }} {...props}>
        {children}
    </mdui-list>
}