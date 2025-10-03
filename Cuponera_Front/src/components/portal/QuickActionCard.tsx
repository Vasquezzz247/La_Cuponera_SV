import type { LucideIcon } from "lucide-react";

type QuickActionCardProps = {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    onClick?: () => void;
};

export default function QuickActionCard({
    icon: Icon,
    title,
    subtitle,
    onClick,
}: QuickActionCardProps) {
    return (
        <button
            onClick={onClick}
            className="p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left"
        >
            <Icon className="h-8 w-8 text-emerald-600 mb-2" />
            <h4 className="font-semibold text-gray-900">{title}</h4>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </button>
    );
}