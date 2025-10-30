import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import OfferCard from "../OfferCard/OfferCard";
import OffersService, { type Offer as ApiOffer } from "@/services/offers";
import "./FeaturedOffersSection.css";

export default function FeaturedOffers() {
    // ahora guardamos directamente el modelo del backend
    const [items, setItems] = useState<ApiOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setErr(null);
                setLoading(true);

                // si tu API soporta paginación, pide solo 8
                const res = await OffersService.list({ per_page: 8 });

                // El endpoint puede devolver un array simple o { data: [...] }
                const list: ApiOffer[] = Array.isArray(res) ? (res as ApiOffer[]) : ((res as any)?.data ?? []);
                if (mounted) setItems(list.slice(0, 8));
            } catch (e: any) {
                if (mounted) setErr(e?.message || "No se pudieron cargar las ofertas.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const limitedOffers = useMemo(() => items.slice(0, 8), [items]);

    return (
        <section className="featured-section">
            <div className="featured-container">
                {/* Header */}
                <div className="featured-header">
                    <div>
                        <h2 className="featured-title">Ofertas Destacadas</h2>
                        <p className="featured-subtitle">Las mejores ofertas disponibles ahora</p>
                    </div>
                    <Button variant="outline" className="see-all-btn" asChild>
                        <Link to="/ofertas">Ver todas las ofertas</Link>
                    </Button>
                </div>

                {/* Estados */}
                {loading && <div className="py-10 text-center text-gray-500">Cargando ofertas…</div>}
                {err && !loading && <div className="py-10 text-center text-red-600">{err}</div>}

                {/* Scroll horizontal */}
                {!loading && !err && (
                    <div className="featured-scroll-container">
                        <div className="featured-scroll">
                            {limitedOffers.map((offer, index) => (
                                <OfferCard
                                    key={offer.id as any}
                                    offer={offer}                         // ⬅️ pasamos el modelo del backend directo
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                />
                            ))}

                            {limitedOffers.length === 0 && (
                                <div className="py-10 text-center text-gray-500 w-full">
                                    No hay ofertas disponibles.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
