
type DashboardWidgetBoxProps = {
    children?: React.ReactNode,
    title: string,
    icon?: React.ReactNode,
    link?: string,
    colspan?: number
}

export default function DashboardWidgetBox(props: DashboardWidgetBoxProps) {

    let colspanClass = props.colspan ? `col-span-${props.colspan}` : 'col-span-2';

    return (
        <div className={`p-4 rounded-md border-1 ${colspanClass} flex flex-col`}>
            <div className="flex space-x-2 items-center">
                <span className="text-gray-600">{props.icon && props.icon}</span>
                <h1 className="text-md font-semibold">{props.title}</h1>
            </div>
            <div className="flex items-center flex-1 w-full">
                {props.children}
            </div>
        </div>
    )
} 