import { ListItem } from "mdui"

interface Args extends React.HTMLAttributes<ListItem> {
    title: string
    description?: string
    icon: string
    disabled?: boolean
}

export default function Preference({ title, icon, disabled, description, ...props }: Args) {
    // @ts-ignore: 为什么 ...props 要说参数不兼容呢?
    return <mdui-list-item disabled={disabled ? true : undefined} rounded icon={icon} {...props}>
        {title}
        {description && <span slot="description">{description}</span>}
    </mdui-list-item>
}