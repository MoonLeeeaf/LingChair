export default function ProgressDialogInner({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} style={{
        display: 'flex',
        alignItems: 'center',
        ...props.style
    }} >
        <mdui-circular-progress style={{
            marginLeft: '3px',
        }}></mdui-circular-progress>
        <span style={{
            marginLeft: '20px',
        }}>{ children }</span>
    </div>
}
