// src/pages/offers/AllOffersView.tsx
import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, Grid3x3, List, X } from "lucide-react";

import OfferCard from "@/components/OfferCard/OfferCard";
import OffersService, { type Offer as ApiOffer } from "@/services/offers";

function humanizeTimeLeft(expiresAt?: string | Date): string {
    if (!expiresAt) return "—";
    const end = new Date(expiresAt).getTime();
    const now = Date.now();
    const diff = Math.max(end - now, 0);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} día${days > 1 ? "s" : ""}`;
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    return `${hours} h`;
}

export default function AllOffersView() {
    // UI state
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("featured");

    // Data state
    const [offers, setOffers] = useState<ApiOffer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const categories = [
        { id: "all", name: "Todas" },
        { id: "restaurants", name: "Restaurantes" },
        { id: "beauty", name: "Belleza & Spa" },
        { id: "tech", name: "Tecnología" },
        { id: "entertainment", name: "Entretenimiento" },
        { id: "health", name: "Salud" },
    ];

    // La API usa ?q= para búsqueda y pagina con ?page, ?per_page
    const listParams = useMemo(() => {
        const params: Record<string, any> = { page, per_page: 24 };
        if (searchTerm.trim()) params.q = searchTerm.trim(); // 👈 nombre correcto del query en backend
        // selectedCategory / sortBy no están implementados aún en la API pública;
        // los dejamos listos por si luego agregas filtros en el backend.
        params.category = selectedCategory !== "all" ? selectedCategory : undefined;
        params.sort = sortBy;
        return params;
    }, [page, searchTerm, selectedCategory, sortBy]);

    useEffect(() => {
        let cancelled = false;
        async function fetchOffers() {
            setLoading(true);
            setError(null);
            try {
                const res = await OffersService.list(listParams);

                // Tu endpoint puede devolver:
                // 1) array simple de ofertas
                // 2) objeto con { data: [...], meta: { total, per_page, ... } }
                const data: ApiOffer[] = Array.isArray(res)
                    ? (res as ApiOffer[])
                    : ((res as any)?.data ?? []);

                if (!cancelled) {
                    setOffers((prev) => (page === 1 ? data : [...prev, ...data]));

                    // detectar si hay más páginas
                    const total = (res as any)?.meta?.total as number | undefined;
                    const perPage =
                        (res as any)?.meta?.per_page ?? (listParams.per_page ?? 24);
                    if (typeof total === "number" && total >= 0) {
                        const totalPages = Math.ceil(total / perPage);
                        setHasMore(page < totalPages);
                    } else {
                        // si no viene meta, inferimos por el tamaño del lote
                        setHasMore(data.length === (listParams.per_page ?? 24));
                    }
                }
            } catch (e: any) {
                console.error(e);
                if (!cancelled) setError(e?.message ?? "Error cargando ofertas");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchOffers();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listParams]);

    // reiniciar a página 1 cuando cambian filtros
    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCategory, sortBy]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
            {/* Header Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -translate-y-48 translate-x-48" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-2xl translate-y-32 -translate-x-32" />

                <div className="relative max-w-7xl mx-auto px-4 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Todas las Ofertas
                        </h1>
                        <p className="text-xl text-emerald-100 mb-8">
                            Descubre increíbles descuentos en tus lugares favoritos
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar restaurantes, servicios, productos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:border-white/40 focus:bg-white/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
                {/* Filters Bar */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        {/* Categories Pills */}
                        <div className="flex flex-wrap items-center gap-2 flex-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-xl transition-all font-medium text-sm ${selectedCategory === cat.id
                                            ? "bg-emerald-600 text-white shadow-md"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Controles SOLO desktop */}
                        <div className="hidden md:flex items-center gap-3">
                            {/* Sort */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="pl-4 pr-10 py-2 border border-gray-200 rounded-xl bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none text-sm font-medium"
                                >
                                    <option value="featured">Destacadas</option>
                                    <option value="discount">Mayor descuento</option>
                                    <option value="newest">Más recientes</option>
                                    <option value="price-low">Precio: menor a mayor</option>
                                    <option value="price-high">Precio: mayor a menor</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                                        }`}
                                >
                                    <Grid3x3 className="h-4 w-4 text-gray-700" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                                        }`}
                                >
                                    <List className="h-4 w-4 text-gray-700" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-600">
                        Mostrando{" "}
                        <span className="font-semibold text-gray-900">{offers.length}</span>{" "}
                        ofertas
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <X className="h-4 w-4" />
                            Limpiar búsqueda
                        </button>
                    )}
                </div>

                {/* Offers Grid */}
                <div
                    className={`mb-12 ${viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            : "space-y-4"
                        }`}
                >
                    {offers.map((offer) => (
                        <div key={offer.id as any} className={viewMode === "list" ? "flex" : ""}>
                            <div className="w-full h-full">
                                {/* OfferCard ahora espera el modelo del backend (ApiOffer) */}
                                <OfferCard offer={offer} style={{ width: "100%", height: "100%" }} />
                            </div>
                        </div>
                    ))}

                    {!loading && offers.length === 0 && !error && (
                        <div className="col-span-full text-center text-gray-500 py-12">
                            No hay ofertas para mostrar.
                        </div>
                    )}
                </div>

                {/* Load More */}
                <div className="text-center pb-12">
                    <button
                        disabled={loading || !hasMore}
                        onClick={() => setPage((p) => p + 1)}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all border-2 ${hasMore
                                ? "bg-white hover:bg-gray-50 border-emerald-600 text-emerald-600 hover:shadow-lg"
                                : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {loading ? "Cargando..." : hasMore ? "Cargar más ofertas" : "No hay más"}
                    </button>
                </div>
            </div>
        </div>
    );
}
