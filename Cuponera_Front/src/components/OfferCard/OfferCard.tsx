// src/components/OfferCard/OfferCard.tsx
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock } from "lucide-react";
import NoImage1 from "../../assets/NoImage1.png";
import NoImage2 from "../../assets/NoImage2.png";
import "./OfferCard.css";
import OfferQuickView from "@/components/OfferQuickView/OfferQuickView";
import type { Offer as ApiOffer } from "@/services/offers";

function daysLeftText(iso?: string) {
    if (!iso) return "—";
    const end = new Date(iso);
    const now = new Date();
    if (Number.isNaN(end.getTime())) return "—";
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - now.getTime()) / 86400000);
    if (diff < 0) return "Expirada";
    if (diff === 0) return "Hoy";
    if (diff === 1) return "1 día";
    return `${diff} días`;
}

function toNumber(v: unknown): number | null {
    const n = typeof v === "string" ? Number(v) : (v as number);
    return Number.isFinite(n) ? n : null;
}

// 👇 define la URL base del backend para imágenes relativas
const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
const ABSOLUTE = /^https?:\/\//i;

interface OfferCardProps {
    offer: ApiOffer;
    style?: React.CSSProperties;
}

export default function OfferCard({ offer, style }: OfferCardProps) {
    const [open, setOpen] = useState(false);

    const fallbackImages = [NoImage1, NoImage2];
    const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

    const {
        img,
        discountPct,
        timeLeft,
        company,
        category,
        priceOfferText,
        priceRegularText,
    } = useMemo(() => {
        const raw =
            (offer as any).image_url || (offer as any).imageUrl || (offer as any).image || "";

        // 🔧 normaliza: si viene relativo (/storage/...), préfix con API_BASE
        const img = raw && !ABSOLUTE.test(raw)
            ? `${API_BASE}${raw.startsWith("/") ? "" : "/"}${raw}`
            : raw;

        const rp = toNumber((offer as any).regular_price);
        const op = toNumber((offer as any).offer_price);
        const pct = rp && op && rp > 0 ? Math.max(0, Math.round((1 - op / rp) * 100)) : 0;

        return {
            img,
            discountPct: pct,
            timeLeft: daysLeftText((offer as any).ends_at),
            company: (offer as any).owner?.name || (offer as any).company || "Empresa",
            category: (offer as any).category || "General",
            priceOfferText: op != null ? `$${op}` : "$",
            priceRegularText: rp != null ? `$${rp}` : "$",
        };
    }, [offer]);

    return (
        <>
            <div
                className="offer-card border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                style={style}
            >
                {/* Imagen */}
                <div className="offer-img-container relative">
                    <img
                        src={img || randomFallback}
                        alt={offer.title}
                        className="offer-img"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = randomFallback;
                        }}
                    />
                    <Badge className="offer-discount">-{discountPct}%</Badge>
                    <Badge variant="secondary" className="offer-category">
                        {category}
                    </Badge>
                </div>

                {/* Título / empresa */}
                <div className="p-3">
                    <h3
                        className="offer-title truncate-title"
                        title={offer.title} // 👈 Tooltip con título completo
                    >
                        {offer.title}
                    </h3>
                    <p className="offer-company">{company}</p>
                </div>

                <div className="offer-content">
                    {/* Precio + Rating */}
                    <div className="offer-price-rating">
                        <div className="offer-price">
                            <span className="price-discount">{priceOfferText}</span>
                            <span className="price-original">{priceRegularText}</span>
                        </div>

                        <div className="offer-rating flex items-center gap-2">
                            <Star className="icon-star text-yellow-400" />
                            <span className="font-medium">5</span>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="offer-meta mt-2">
                        <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="icon-meta" />
                            <span>SV</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-gray-600">
                            <Clock className="icon-meta" />
                            <span>{timeLeft}</span>
                        </div>
                    </div>

                    {/* Button */}
                    <div className="offer-btn-wrapper">
                        <Button
                            className="bg-[#008254] hover:bg-[#2a8f65] text-white font-semibold rounded-lg offer-btn"
                            onClick={() => setOpen(true)}
                        >
                            Ver Oferta
                        </Button>
                    </div>
                </div>
            </div>

            {open && <OfferQuickView offerId={Number(offer.id)} onClose={() => setOpen(false)} />}
        </>
    );
}
