// src/services/offers.ts
import { apiFetch } from "@/lib/http";

/** Modelo principal según tu API */
export type Offer = {
    id: number | string;
    title: string;
    regular_price: number;
    offer_price: number;
    starts_at: string; // "YYYY-MM-DD"
    ends_at: string;   // "YYYY-MM-DD"
    redeem_by: string; // "YYYY-MM-DD"
    quantity: number;
    description?: string;
    status: "available" | "sold_out" | "expired" | string;
    image_url?: string;
    business_id?: number | string;
    created_at?: string;
    updated_at?: string;
    [k: string]: any;
};

/** Payload para crear */
export type OfferCreate = {
    title: string;
    regular_price: number;
    offer_price: number;
    starts_at: string;   // "YYYY-MM-DD"
    ends_at: string;     // "YYYY-MM-DD"
    redeem_by: string;   // "YYYY-MM-DD"
    quantity: number;
    description?: string;
    status: "available" | "sold_out" | "expired" | string;
    image_url?: string;
    [k: string]: any;
};

/** 💳 Payload para pago con tarjeta */
export type CardPaymentPayload = {
    card_number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
};

/** Payload para actualizar (parcial) */
export type OfferUpdate = Partial<OfferCreate>;

/** Cupón/compras del usuario */
export type Coupon = {
    id: number | string;
    offer_id: number | string;
    code?: string;
    status?: "unused" | "used" | "expired" | string;
    purchased_at?: string;
    redeem_by?: string;
    [k: string]: any;
};

export type PurchaseResponse = {
    success?: boolean;
    message?: string;
    coupon?: Coupon;
    [k: string]: any;
};

export type ListParams = {
    page?: number;
    per_page?: number;
    q?: string;
    status?: string;
    min_price?: number;
    max_price?: number;
    starts_before?: string; // "YYYY-MM-DD"
    ends_after?: string;    // "YYYY-MM-DD"
};

/** Helpers */
function toQuery(params?: Record<string, string | number | boolean | undefined>) {
    if (!params) return "";
    const pairs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return pairs.length ? `?${pairs.join("&")}` : "";
}

export const OffersService = {
    /** GET /offers — listado público */
    list: (params?: ListParams) =>
        apiFetch<Offer[]>(`/offers${toQuery(params as any)}`, { method: "GET" }),

    /** GET /offers/mine — ofertas del negocio autenticado */
    mine: () => apiFetch<Offer[]>(`/offers/mine`, { method: "GET", auth: true }),

    /** GET /offers/:id — detalle público */
    get: (id: string | number) =>
        apiFetch<Offer>(`/offers/${id}`, { method: "GET" }),

    /** POST /offers — crear */
    create: (payload: OfferCreate) =>
        apiFetch<Offer>(`/offers`, { method: "POST", body: payload, auth: true }),

    /** PATCH /offers/:id — actualizar */
    update: (id: string | number, payload: OfferUpdate) =>
        apiFetch<Offer>(`/offers/${id}`, { method: "PATCH", body: payload, auth: true }),

    /** DELETE /offers/:id — eliminar */
    remove: (id: string | number) =>
        apiFetch<void>(`/offers/${id}`, { method: "DELETE", auth: true }),

    /** POST /offers/:id/buy — comprar oferta */
    buy: (id: string | number) =>
        apiFetch<PurchaseResponse>(`/offers/${id}/buy`, { method: "POST", auth: true }),

    /** POST /offers/:id/buy con tarjeta (simulación) */
    buyWithCard: (id: string | number, payload: CardPaymentPayload) =>
        apiFetch<PurchaseResponse>(`/offers/${id}/buy`, {
            method: "POST",
            auth: true,
            body: payload,
        }),

    /** GET /my/coupons — cupones del usuario autenticado */
    myCoupons: () =>
        apiFetch<Coupon[]>(`/my/coupons`, { method: "GET", auth: true }),
};

export default OffersService;
