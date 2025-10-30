import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, Lock, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import OffersService, { type CardPaymentPayload, type PurchaseResponse } from "@/services/offers";

type Props = {
    offerId: number | string;
    onClose: () => void;
    onSuccess?: (res: PurchaseResponse) => void;
};

function numbersOnly(s: string) {
    return s.replace(/\D+/g, "");
}

function formatCardNumber(s: string) {
    return numbersOnly(s).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

export default function OfferPaymentModal({ offerId, onClose, onSuccess }: Props) {
    const [card, setCard] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [cvc, setCvc] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    // bloqueo de scroll
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = original; };
    }, []);

    // cerrar con esc
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    function handleBackdrop(e: React.MouseEvent) {
        if (e.target === backdropRef.current) onClose();
    }

    const valid = useMemo(() => {
        const digits = numbersOnly(card);
        const m = Number(month);
        const y = Number(year);
        const c = numbersOnly(cvc);
        return digits.length === 16 && m >= 1 && m <= 12 && y >= new Date().getFullYear() && c.length >= 3 && c.length <= 4;
    }, [card, month, year, cvc]);

    async function handlePay(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setMsg(null);

        const payload: CardPaymentPayload = {
            card_number: numbersOnly(card),
            exp_month: Number(month),
            exp_year: Number(year),
            cvc: numbersOnly(cvc),
        };

        if (!valid) {
            setError("Revisa los datos de la tarjeta.");
            return;
        }

        setLoading(true);
        try {
            const res = await OffersService.buy(offerId, payload);
            setMsg("✅ Pago simulado exitoso. ¡Compra realizada!");
            onSuccess?.(res);
            // puedes cerrar automáticamente tras 1.2s
            setTimeout(onClose, 1200);
        } catch (e: any) {
            setError(e?.message || "No se pudo procesar el pago.");
        } finally {
            setLoading(false);
        }
    }

    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            ref={backdropRef}
            onClick={handleBackdrop}
            className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog" aria-modal="true"
        >
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <h3 className="font-semibold">Pago con tarjeta</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
                        aria-label="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handlePay} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">Número de tarjeta</label>
                        <input
                            inputMode="numeric"
                            autoComplete="cc-number"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            placeholder="4242 4242 4242 4242"
                            value={card}
                            onChange={(e) => setCard(formatCardNumber(e.target.value))}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Mes</label>
                            <input
                                inputMode="numeric"
                                autoComplete="cc-exp-month"
                                className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                placeholder="MM"
                                value={month}
                                onChange={(e) => setMonth(numbersOnly(e.target.value).slice(0, 2))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Año</label>
                            <input
                                inputMode="numeric"
                                autoComplete="cc-exp-year"
                                className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                placeholder="YYYY"
                                value={year}
                                onChange={(e) => setYear(numbersOnly(e.target.value).slice(0, 4))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">CVC</label>
                            <input
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                placeholder="123"
                                value={cvc}
                                onChange={(e) => setCvc(numbersOnly(e.target.value).slice(0, 4))}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Lock className="h-4 w-4" />
                        <span>Pago simulado y seguro</span>
                    </div>

                    {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
                    {msg && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm">{msg}</div>}

                    <Button
                        type="submit"
                        disabled={loading || !valid}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {loading ? "Procesando..." : "Pagar y Comprar"}
                    </Button>
                </form>
            </div>
        </div>,
        document.body
    );
}
