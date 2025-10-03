import type { LucideIcon } from "lucide-react";

type StatCardProps = {
    title: string;
    subtitle: string;
    value: number | string;
    icon: LucideIcon;
    /** color de acento */
    accent?: "emerald" | "blue" | "orange" | "purple" | "gray";
    className?: string;
};

const styles: Record<
    NonNullable<StatCardProps["accent"]>,
    { iconBox: string; value: string }
> = {
    emerald: { iconBox: "bg-emerald-50 text-emerald-700", value: "text-emerald-700" },
    blue: { iconBox: "bg-blue-50 text-blue-700", value: "text-blue-700" },
    orange: { iconBox: "bg-orange-50 text-orange-700", value: "text-orange-700" },
    purple: { iconBox: "bg-purple-50 text-purple-700", value: "text-purple-700" },
    gray: { iconBox: "bg-gray-100 text-gray-700", value: "text-gray-700" },
};

export default function StatCard({
    title,
    subtitle,
    value,
    icon: Icon,
    accent = "gray",
    className = "",
}: StatCardProps) {
    const s = styles[accent];
    return (
        <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
            <div className="flex items-start gap-3">
                <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${s.iconBox}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">{title}</div>
                    <div className="text-xs text-gray-500">{subtitle}</div>
                </div>
            </div>
            <div className={`mt-4 text-3xl font-bold ${s.value}`}>{value}</div>
        </div>
    );
}
