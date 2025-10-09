// src/services/offers.ts
import { apiFetch } from "@/lib/http";

/** Modelo principal según tu API (GET /offers, /offers/:id, /offers/mine) */
export type Offer = {
    id: number | string;
    title: string;
    regular_price: number;
    offer_price: number;
    starts_at: string;   // "YYYY-MM-DD"
    ends_at: string;     // "YYYY-MM-DD"
    redeem_by: string;   // "YYYY-MM-DD"
    quantity: number;
    sold_out: boolean;   // <- viene en la respuesta
    description?: string;
    status: "available" | "sold_out" | "expired" | string;
    owner: {             // <- viene en la respuesta
        id: number;
        name: string;
    };
    created_at?: string; // p.ej. "2025-09-24T01:41:38+00:00"
    updated_at?: string;
    // Campos adicionales que puedas agregar después:
    image_url?: string;
    [k: string]: any;
};

/** Payload para crear (POST /offers) */
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
    // image_url?: string; // si luego lo agregas en el backend, lo habilitas aquí
    [k: string]: any;
};

/** Payload para actualizar (PATCH /offers/:id) — parcial */
export type OfferUpdate = Partial<OfferCreate>;

/** 💳 Pago con tarjeta (POST /offers/:id/buy) */
export type CardPaymentPayload = {
    card_number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
};

/** Cupón/compras del usuario (GET /my/coupons) */
export type Coupon = {
    id: number | string;
    offer_id: number | string;
    code?: string;
    status?: "unused" | "used" | "expired" | string;
    purchased_at?: string;
    redeem_by?: string;
    [k: string]: any;
};

/** Respuesta de compra (ajústalo si tu backend devuelve otra cosa) */
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
    mine: () =>
        apiFetch<Offer[]>(`/offers/mine`, { method: "GET", auth: true }),

    /** GET /offers/:id — detalle público */
    get: (id: string | number) =>
        apiFetch<Offer>(`/offers/${id}`, { method: "GET" }),

    /** POST /offers — crear (requiere auth) */
    create: (payload: OfferCreate) =>
        apiFetch<Offer>(`/offers`, { method: "POST", body: payload, auth: true }),

    /** PATCH /offers/:id — actualizar (requiere auth) */
    update: (id: string | number, payload: OfferUpdate) =>
        apiFetch<Offer>(`/offers/${id}`, { method: "PATCH", body: payload, auth: true }),

    /** DELETE /offers/:id — eliminar (requiere auth) */
    remove: (id: string | number) =>
        apiFetch<void>(`/offers/${id}`, { method: "DELETE", auth: true }),

    /** POST /offers/:id/buy — comprar oferta (requiere auth y payload de tarjeta) */
    buy: (id: string | number, payload: CardPaymentPayload) =>
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