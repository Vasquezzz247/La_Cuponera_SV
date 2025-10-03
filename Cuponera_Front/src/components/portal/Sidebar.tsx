import type { LucideIcon } from "lucide-react";

export type SidebarItem = {
    id: string;
    label: string;
    icon: LucideIcon;
};

type Brand = {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    iconBgClass?: string;
};

type SidebarProps = {
    brand: Brand;
    items: SidebarItem[];
    activeId: string;
    onSelect: (id: string) => void;
    footer?: React.ReactNode;
};

export default function Sidebar({
    brand,
    items,
    activeId,
    onSelect,
    footer,
}: SidebarProps) {
    const Icon = brand.icon;
    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-40 flex flex-col">
            {/* Brand */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${brand.iconBgClass ?? "from-emerald-500 to-emerald-600"} rounded-xl flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">{brand.title}</h2>
                        {brand.subtitle && <p className="text-xs text-gray-600">{brand.subtitle}</p>}
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="p-4 flex-1 overflow-auto">
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => onSelect(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeId === item.id
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {footer ? <div className="p-4 border-t border-gray-200">{footer}</div> : null}
        </aside>
    );
}
