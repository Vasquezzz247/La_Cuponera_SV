import { Link } from "react-router-dom";
import { Clock3, CheckCircle2, Pencil, Trash2 } from "lucide-react";

type OfferCardProps = {
    id: number | string;
    title: string;
    status: string;
    coupons_count?: number;
    ends_at: string;
    onView?: (id: number | string) => void;
    onEdit?: (id: number | string) => void;
};

function daysLeftText(iso: string) {
    const end = new Date(iso);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Expirada";
    if (diff === 0) return "Hoy";
    if (diff === 1) return "1 día";
    return `${diff} días`;
}

function isExpired(iso: string) {
    const end = new Date(iso);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return end.getTime() < now.getTime();
}

type BusinessOffersListProps = {
    offers: OfferCardProps[];
    onDelete?: (id: number | string) => void | Promise<void>;
};

export default function BusinessOffersList({ offers, onDelete }: BusinessOffersListProps) {
    if (!offers?.length)
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                No tienes cupones creados aún.
            </div>
        );

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
            {offers.map((offer) => {
                const expired = isExpired(offer.ends_at);
                const days = daysLeftText(offer.ends_at);

                return (
                    <div
                        key={offer.id}
                        className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-gray-900 leading-tight">
                                    {offer.title}
                                </h3>
                                <span
                                    className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${offer.status === "available" && !expired
                                        ? "bg-emerald-100 text-emerald-700"
                                        : expired
                                            ? "bg-gray-100 text-gray-600"
                                            : "bg-amber-100 text-amber-700"
                                        }`}
                                >
                                    {offer.status === "available" && !expired
                                        ? "Activo"
                                        : expired
                                            ? "Expirado"
                                            : "Pendiente"}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <span className="font-medium text-gray-800">
                                    {offer.coupons_count ?? 0}
                                </span>{" "}
                                vendidos
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <Clock3 className="h-4 w-4 text-amber-500" />
                                <span>{days}</span>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={() => onDelete?.(offer.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                            </button>
                            <Link
                                to={`/business-portal/offers/${offer.id}/edit`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 transition-all"
                            >
                                <Pencil className="h-4 w-4" />
                                Editar
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div >
    );
}
