// src/components/OfferQuickView.tsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, Clock, Star, ShoppingCart, Receipt } from "lucide-react";
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

type Mode = "buy" | "owned";

interface Props {
    offerId: number;
    onClose: () => void;
    /** NUEVO: controla el footer; si no lo pasas, se deduce por recibo */
    mode?: Mode;
    /** NUEVO: meta del cupón comprado */
    receiptNo?: string;
    couponCode?: string;
    paidAt?: string; // ISO
}

function fmtMoney(v?: number) {
    if (v == null) return "—";
    return `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
function daysLeftText(iso?: string) {
    if (!iso) return "";
    const end = new Date(iso);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - now.getTime()) / 86400000);
    if (diff < 0) return "Expirada";
    if (diff === 0) return "Hoy";
    if (diff === 1) return "1 día";
    return `${diff} días`;
}
function percentOff(regular?: number, offer?: number) {
    const r = Number(regular);
    const o = Number(offer);
    if (!r || !o || r <= 0) return 0;
    const pct = Math.round((1 - o / r) * 100);
    return Math.max(0, Math.min(100, pct));
}

export default function OfferQuickView({
    offerId,
    onClose,
    mode,
    receiptNo,
    couponCode,
    paidAt,
}: Props) {
    const [loading, setLoading] = useState(true);
    const [offer, setOffer] = useState<OfferDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [buyMsg, setBuyMsg] = useState<string | null>(null);
    const [showPay, setShowPay] = useState(false);
    const backdropRef = useRef<HTMLDivElement>(null);

    // autodetección: si hay recibo => owned
    const isOwned: boolean = (mode ?? (receiptNo ? "owned" : "buy")) === "owned";

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

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

    function handleBackdrop(e: React.MouseEvent) {
        if (e.target === backdropRef.current) onClose();
    }
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const fallbackImages = [NoImage1, NoImage2];
    const img =
        offer?.image_url ||
        offer?.image ||
        fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    const business =
        offer?.business_name || offer?.business?.name || offer?.owner?.name || "Empresa";
    const discountPct = percentOff(offer?.regular_price, offer?.offer_price);

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
                    <button
                        onClick={onClose}
                        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
                        aria-label="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Imagen + % descuento */}
                    <div className="relative w-full h-72 md:h-80 overflow-hidden bg-gray-100">
                        <div className="absolute left-3 top-3 z-10">
                            <span className="inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white shadow">
                                -{Number.isFinite(discountPct) ? discountPct : 0}%
                            </span>
                        </div>
                        <img src={img} alt={offer?.title ?? "Oferta"} className="w-full h-full object-cover" />
                    </div>

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

                                    <div className="text-right">
                                        <div className="text-emerald-700 text-3xl font-bold">
                                            {fmtMoney(offer.offer_price)}
                                        </div>
                                        <div className="text-gray-400 line-through">{fmtMoney(offer.regular_price)}</div>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div className="inline-flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-emerald-700" />
                                        <span>SV</span>
                                    </div>
                                    <div className="inline-flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-emerald-700" />
                                        <span>{daysLeftText(offer.ends_at ?? offer.redeem_by)}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-2">
                                        <Star className="h-4 w-4 text-emerald-700" />
                                        <span>5</span>
                                    </div>
                                </div>

                                {offer.description && (
                                    <p className="mt-5 text-gray-700 leading-relaxed">{offer.description}</p>
                                )}

                                {/* Footer: comprar vs. datos del cupón */}
                                <div className="mt-7 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                    {isOwned ? (
                                        <>
                                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm font-semibold">
                                                <Receipt className="h-4 w-4" />
                                                <span>Recibo: {receiptNo ?? "—"}</span>
                                            </div>
                                            {couponCode && (
                                                <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 px-3 py-2 text-sm">
                                                    Código: <span className="font-mono">{couponCode}</span>
                                                </div>
                                            )}
                                            {paidAt && (
                                                <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 px-3 py-2 text-sm">
                                                    Pagado: {new Date(paidAt).toLocaleString()}
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                onClick={onClose}
                                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                            >
                                                Cerrar
                                            </Button>
                                        </>
                                    ) : (
                                        <>
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
                                        </>
                                    )}
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

            {!isOwned && showPay && offer && (
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
