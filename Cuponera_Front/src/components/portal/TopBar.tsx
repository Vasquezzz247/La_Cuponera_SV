import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { useId } from "react";

type TopBarProps = {
    title: string;
    searchPlaceholder?: string;
    onSearchChange?: (value: string) => void;
    primaryButton?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
    rightExtra?: React.ReactNode; // notificaciones, etc
    avatar?: {
        initials: string;
        name: string;
        email?: string;
        bgClass?: string; // ej: "bg-emerald-600"
    };
};

export default function TopBar({
    title,
    searchPlaceholder = "Buscar...",
    onSearchChange,
    primaryButton,
    rightExtra,
    avatar,
}: TopBarProps) {
    const inputId = useId();
    const PBIcon = primaryButton?.icon;

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    {onSearchChange && (
                        <div className="relative">
                            <label htmlFor={inputId} className="sr-only">Buscar</label>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                id={inputId}
                                type="text"
                                placeholder={searchPlaceholder}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            />
                        </div>
                    )}

                    {/* Primary button */}
                    {primaryButton && (
                        <button
                            onClick={primaryButton.onClick}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
                        >
                            {PBIcon ? <PBIcon className="h-4 w-4" /> : null}
                            {primaryButton.label}
                        </button>
                    )}

                    {rightExtra}

                    {/* Avatar */}
                    {avatar && (
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className={`w-8 h-8 ${avatar.bgClass ?? "bg-emerald-600"} rounded-lg flex items-center justify-center text-white font-semibold text-sm`}>
                                {avatar.initials}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-gray-900">{avatar.name}</p>
                                {avatar.email && <p className="text-xs text-gray-600">{avatar.email}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}