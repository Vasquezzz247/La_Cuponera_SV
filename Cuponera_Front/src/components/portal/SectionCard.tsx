type SectionCardProps = {
    title?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
};

export default function SectionCard({
    title,
    actions,
    children,
    className = "",
    headerClassName = "",
    bodyClassName = "",
}: SectionCardProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
            {(title || actions) && (
                <div className={`p-6 border-b border-gray-200 flex items-center justify-between ${headerClassName}`}>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {actions}
                </div>
            )}
            <div className={`p-6 ${bodyClassName}`}>{children}</div>
        </div>
    );
}
