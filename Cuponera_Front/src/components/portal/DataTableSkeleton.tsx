type Props = {
    rows?: number;
};

export default function DataTableSkeleton({ rows = 3 }: Props) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[1fr,140px,140px,120px,120px] gap-4 border-b px-4 py-3 text-sm font-medium text-gray-600 sm:grid">
                <div>Título</div>
                <div className="text-center">Estado</div>
                <div className="text-center">Vendidos</div>
                <div className="text-center">Vence</div>
                <div className="text-center">Acciones</div>
            </div>

            <ul className="divide-y">
                {Array.from({ length: rows }).map((_, i) => (
                    <li
                        key={i}
                        className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[1fr,140px,140px,120px,120px]"
                    >
                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200 sm:justify-self-center" />
                        <div className="h-4 w-12 animate-pulse rounded bg-gray-200 sm:justify-self-center" />
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200 sm:justify-self-center" />
                        <div className="h-8 w-28 animate-pulse rounded bg-gray-200 sm:justify-self-center" />
                    </li>
                ))}
            </ul>
        </div>
    );
}
