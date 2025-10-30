// src/services/offers.ts
import { apiFetch } from "@/lib/http";

/** Modelo principal según tu API */
export type Offer = {
    id: number | string,
    title: string,
    regular_price: number,
    offer_price: number,
    starts_at: string,   // YYYY-MM-DD
    ends_at: string,     // YYYY-MM-DD
    redeem_by: string,   // YYYY-MM-DD
    quantity: number | null,
    sold_out: boolean,
    description?: string | null,
    status: "available" | "unavailable" | string,
    owner: { id: number; name: string },
    created_at?: string,
    updated_at?: string,
    image_url?: string | null,
    [k: string]: any,
};

/** Payload JSON para crear/actualizar SIN imagen */
export type OfferCreateJson = {
    title: string,
    regular_price: number,
    offer_price: number,
    starts_at: string,
    ends_at: string,
    redeem_by: string,
    quantity: number | null,
    description?: string | null,
    status: "available" | "unavailable",
};

export type OfferUpdateJson = Partial<OfferCreateJson>;

/** Respuestas paginadas estándar de Laravel Resource */
export type Paginated<T> = {
    data: T[];
    links?: any;
    meta?: any;
};

/** 💳 Pago con tarjeta */
export type CardPaymentPayload = {
    card_number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
};

export type Coupon = {
    id: number | string;
    offer_id?: number | string;
    code?: string;
    status?: "active" | "used" | "expired" | string;
    paid_at?: string;
    receipt_no?: string;
    card_brand?: string;
    card_last4?: string;
    redeem_by?: string;
    offer?: {
        id: number | string;
        title: string;
        price: number;
        redeem_by: string;
    };
    [k: string]: any;
};

export type PurchaseResponse = {
    message?: string;
    amounts?: {
        unit_price: number;
        platform_fee_percent: number;
        platform_fee_amount: number;
        business_amount: number;
    };
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
    starts_before?: string;
    ends_after?: string;
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
    /** GET /offers — listado público (paginado) */
    list: (params?: ListParams) =>
        apiFetch<Paginated<Offer>>(`/offers${toQuery(params as any)}`, { method: "GET" }),

    /** GET /offers/mine — ofertas del negocio autenticado (paginado) */
    mine: () =>
        apiFetch<Paginated<Offer>>(`/offers/mine`, { method: "GET", auth: true }),

    /** GET /offers/:id — detalle público */
    get: (id: string | number) =>
        apiFetch<Offer>(`/offers/${id}`, { method: "GET" }),

    /**
     * POST /offers — crear
     * - Acepta JSON (OfferCreateJson)
     * - O FormData (para subir imagen con key "image")
     */
    create: (payload: OfferCreateJson | FormData) =>
        apiFetch<Offer>(`/offers`, {
            method: "POST",
            body: payload as any, // apiFetch debe detectar FormData para no setear Content-Type
            auth: true,
        }),

    /**
     * PATCH /offers/:id — actualizar
     * - Acepta JSON parcial
     * - O FormData (para cambiar imagen, etc.)
     */
    update: (id: string | number, payload: OfferUpdateJson | FormData) =>
        apiFetch<Offer>(`/offers/${id}`, {
            method: "PATCH",
            body: payload as any,
            auth: true,
        }),

    /** DELETE /offers/:id — eliminar */
    remove: (id: string | number) =>
        apiFetch<void>(`/offers/${id}`, { method: "DELETE", auth: true }),

    /** POST /offers/:id/buy — comprar oferta */
    buy: (id: string | number, payload: CardPaymentPayload) =>
        apiFetch<PurchaseResponse>(`/offers/${id}/buy`, {
            method: "POST",
            auth: true,
            body: payload,
        }),

    /** GET /my/coupons — cupones del usuario autenticado (paginado en tu API; ajusta si no) */
    myCoupons: () =>
        apiFetch<Paginated<Coupon>>(`/my/coupons`, { method: "GET", auth: true }),
};

export default OffersService;