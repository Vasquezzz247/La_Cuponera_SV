import type { LucideIcon } from "lucide-react";

type Props = {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    className?: string;
};

export default function SectionTitle({ title, subtitle, icon: Icon, className }: Props) {
    return (
        <div className={`flex items-center gap-3 ${className ?? ""}`}>
            {Icon && (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                </span>
            )}
            <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
        </div>
    );
}
