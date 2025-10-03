import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
    icon: LucideIcon;
    title: string;
    description?: string;
    cta?: ReactNode;
    className?: string;
};

export default function EmptyState({ icon: Icon, title, description, cta, className = "" }: Props) {
    return (
        <div className={`rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-10 text-center ${className}`}>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <Icon className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            {description && <p className="text-gray-600 max-w-md mx-auto mb-6">{description}</p>}
            {cta}
        </div>
    );
}
