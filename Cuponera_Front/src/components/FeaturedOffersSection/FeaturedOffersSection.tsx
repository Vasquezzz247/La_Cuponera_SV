// src/components/FeaturedOffers/FeaturedOffersSection.tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import OfferCard from "../OfferCard/OfferCard";
import { OffersService, type Offer } from "@/services/offers";
import "./FeaturedOffersSection.css";

type CardOffer = {
    id: number;
    title: string;
    company: string;
    image: string;
    discount: number;        // %
    category: string;
    discountPrice: number;   // offer_price
    originalPrice: number;   // regular_price
    rating: number;
    reviews: number;
    location: string;
    timeLeft: string;
};

function percentOff(regular?: number, offer?: number) {
    if (!regular || !offer || regular <= 0) return 0;
    const pct = Math.round((1 - offer / regular) * 100);
    return Math.max(0, Math.min(100, pct));
}

function daysLeftText(ends_at?: string) {
    if (!ends_at) return "";
    const end = new Date(ends_at);
    const now = new Date();
    // normaliza a medianoche para contar días enteros
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expirada";
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "1 día";
    return `${diffDays} días`;
}

function mapToCard(o: Offer): CardOffer {
    return {
        id: Number(o.id),
        title: o.title,
        company:
            // si tu API manda negocio embebido, ajusta estos campos
            (o as any).business_name ??
            (o as any).business?.name ??
            "Empresa",
        image: (o as any).image_url ?? "",
        discount: percentOff(o.regular_price as any, o.offer_price as any),
        category: (o as any).category ?? "General",
        discountPrice: Number(o.offer_price),
        originalPrice: Number(o.regular_price),
        rating: (o as any).rating ?? 0,
        reviews: (o as any).reviews ?? 0,
        location: (o as any).location ?? "—",
        timeLeft: daysLeftText(o.ends_at as any),
    };
}

export default function FeaturedOffers() {
    const [items, setItems] = useState<CardOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setErr(null);
                setLoading(true);
                // si tu API soporta paginación por query params, puedes pasar { per_page: 8 }
                const res = await OffersService.list();
                const list = Array.isArray(res) ? res : (res as any)?.data ?? [];
                const mapped = list.map(mapToCard).slice(0, 8);
                if (mounted) setItems(mapped);
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
                {loading && (
                    <div className="py-10 text-center text-gray-500">Cargando ofertas…</div>
                )}
                {err && !loading && (
                    <div className="py-10 text-center text-red-600">{err}</div>
                )}

                {/* Scroll horizontal */}
                {!loading && !err && (
                    <div className="featured-scroll-container">
                        <div className="featured-scroll">
                            {limitedOffers.map((offer, index) => (
                                <OfferCard
                                    key={offer.id}
                                    offer={offer}
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