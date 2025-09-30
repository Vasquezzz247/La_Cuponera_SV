// src/components/OfferQuickView.tsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, Clock, Star, ShoppingCart } from "lucide-react";
import NoImage1 from "@/assets/NoImage1.png";
import NoImage2 from "@/assets/NoImage2.png";
import OffersService from "@/services/offers";
import { Button } from "@/components/ui/button";
import OfferPaymentModal from "@/components/OfferPaymentModal/OfferPaymentModal";

type OfferDetail = {
    id: number;
    title: string;
    description?: string;
    image_url?: string;
    image?: string;
    business_name?: string;
    business?: { name?: string };
    owner?: { id: number; name?: string };
    category?: string;
    regular_price?: number;
    offer_price?: number;
    starts_at?: string;
    ends_at?: string;
    redeem_by?: string;
    quantity?: number;
    rating?: number;
    reviews?: number;
    location?: string;
    status?: string;
};

interface Props {
    offerId: number;
    onClose: () => void;
}

function fmtMoney(v?: number) {
    if (v == null) return "—";
    return `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function daysLeftText(ends_at?: string) {
    if (!ends_at) return "";
    const end = new Date(ends_at);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Expirada";
    if (diff === 0) return "Hoy";
    if (diff === 1) return "1 día";
    return `${diff} días`;
}

export default function OfferQuickView({ offerId, onClose }: Props) {
    const [loading, setLoading] = useState(true);
    const [offer, setOffer] = useState<OfferDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [buyMsg, setBuyMsg] = useState<string | null>(null);
    const [showPay, setShowPay] = useState(false);

    const backdropRef = useRef<HTMLDivElement>(null);

    // Bloquea scroll del body mientras el modal está abierto
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, []);

    // Carga de datos (soporta { data: {...} } o objeto plano)
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            setBuyMsg(null);
            try {
                const data = await OffersService.get(offerId);
                const unwrapped = (data as any)?.data ?? data;
                if (mounted) setOffer(unwrapped as OfferDetail);
            } catch (e: any) {
                if (mounted) setError(e?.message || "No se pudo cargar la oferta.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [offerId]);

    // Cierre al click fuera
    function handleBackdrop(e: React.MouseEvent) {
        if (e.target === backdropRef.current) onClose();
    }

    // Cierre con tecla Esc
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const fallbackImages = [NoImage1, NoImage2];
    const img =
        offer?.image_url ||
        offer?.image ||
        fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

    // Nombre de empresa/owner correcto según tu API
    const business =
        offer?.business_name || offer?.business?.name || offer?.owner?.name || "Empresa";

    if (typeof document === "undefined") return null;

    return createPortal(
        <>
            <div
                ref={backdropRef}
                onClick={handleBackdrop}
                className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
            >
                <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Cerrar */}
                    <button
                        onClick={onClose}
                        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
                        aria-label="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Imagen */}
                    <div className="w-full h-72 md:h-80 overflow-hidden bg-gray-100">
                        <img src={img} alt={offer?.title ?? "Oferta"} className="w-full h-full object-cover" />
                    </div>

                    {/* Body */}
                    <div className="p-6 md:p-8">
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-2/3" />
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-20 bg-gray-200 rounded" />
                            </div>
                        ) : error ? (
                            <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
                        ) : offer ? (
                            <>
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{offer.title}</h2>
                                        <p className="text-gray-600 mt-1">{business}</p>
                                    </div>

                                    {/* Precio */}
                                    <div className="text-right">
                                        <div className="text-emerald-700 text-3xl font-bold">
                                            {fmtMoney(offer.offer_price)}
                                        </div>
                                        <div className="text-gray-400 line-through">
                                            {fmtMoney(offer.regular_price)}
                                        </div>
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div className="inline-flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-emerald-700" />
                                        <span>{offer.location ?? "—"}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-emerald-700" />
                                        <span>{daysLeftText(offer.ends_at ?? offer.redeem_by)}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-2">
                                        <Star className="h-4 w-4 text-emerald-700" />
                                        <span>
                                            {offer.rating ?? 0}{" "}
                                            <span className="text-gray-400">({offer.reviews ?? 0})</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Descripción */}
                                {offer.description && (
                                    <p className="mt-5 text-gray-700 leading-relaxed">{offer.description}</p>
                                )}

                                {/* Acciones */}
                                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={() => setShowPay(true)}
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white"
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Comprar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    >
                                        Cerrar
                                    </Button>
                                </div>

                                {buyMsg && (
                                    <div
                                        className="mt-4 text-sm p-3 rounded-lg border"
                                        style={{
                                            borderColor: buyMsg.startsWith("✅") ? "#10B981" : "#F87171",
                                            color: buyMsg.startsWith("✅") ? "#065F46" : "#991B1B",
                                            background: buyMsg.startsWith("✅") ? "#ECFDF5" : "#FEF2F2",
                                        }}
                                    >
                                        {buyMsg}
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Modal de Pago */}
            {showPay && offer && (
                <OfferPaymentModal
                    offerId={offer.id}
                    onClose={() => setShowPay(false)}
                    onSuccess={() => {
                        setBuyMsg("✅ ¡Compra realizada con éxito!");
                        setShowPay(false);
                    }}
                />
            )}
        </>,
        document.body
    );
}
