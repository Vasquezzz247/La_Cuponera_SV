import { Search } from "lucide-react";

type ToolbarProps = {
    onSearch?: (q: string) => void;
    filters?: React.ReactNode;
    right?: React.ReactNode;
    placeholder?: string;
};

export default function Toolbar({ onSearch, filters, right, placeholder = "Buscar..." }: ToolbarProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {onSearch && (
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder={placeholder}
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        />
                    </div>
                )}

                {filters && <div className="flex items-center gap-3">{filters}</div>}
                {right && <div className="flex items-center gap-3 ml-auto">{right}</div>}
            </div>
        </div>
    );
}
