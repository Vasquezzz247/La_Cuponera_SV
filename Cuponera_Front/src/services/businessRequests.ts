// src/services/businessRequests.ts
import { apiFetch } from "@/lib/http";

/** Estados posibles del flujo */
export type BusinessRequestStatus = "pending" | "approved" | "rejected";

/** Payload para crear la solicitud de negocio (POST /request-business) */
export type CreateBusinessRequestPayload = {
    company_name: string;
    company_nit: string;
    company_email: string;
    company_phone: string;
    company_address: string;
    company_description: string;
    platform_fee_percent: number; // ej. 50 (porcentaje)
};

/** Usuario embebido en el listado */
export type BRUser = {
    id: number;
    name: string;
    last_name?: string | null;
    email: string;
    email_verified_at?: string | null;
    dui?: string | null;
    username?: string | null;
    date_of_birth?: string | null;
    platform_fee_percent?: number | null;
    created_at?: string;
    updated_at?: string;
    // ...otros campos que tu API incluya
};

/** Item del GET /business-requests */
export type BusinessRequestItem = {
    id: number;
    user_id: number;
    status: BusinessRequestStatus;
    created_at: string;
    updated_at: string;

    company_name: string | null;
    company_phone: string | null;
    company_address: string | null;
    company_description: string | null;
    platform_fee_percent: number | null;
    company_nit: string | null;
    company_email: string | null;

    user: BRUser;
};

/** Parámetros de listado (si luego los soportas en backend) */
export type BRListParams = {
    page?: number;
    per_page?: number;
    q?: string;
    status?: BusinessRequestStatus;
};

function toQuery(params?: Record<string, string | number | boolean | undefined>) {
    if (!params) return "";
    const pairs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return pairs.length ? `?${pairs.join("&")}` : "";
}

/**
 * Servicio de Business Requests
 *
 * Rutas:
 *  - POST /request-business
 *  - POST /business-requests/:request_id/approve
 *  - POST /business-requests/:request_id/reject
 *  - GET  /business-requests
 */
export const BusinessRequestsService = {
    /** Crea una solicitud de negocio (requiere auth del usuario solicitante) */
    create: (payload: CreateBusinessRequestPayload) =>
        apiFetch<void>(`/request-business`, {
            method: "POST",
            auth: true,
            body: payload,
        }),

    /** Aprueba una solicitud (admin). No requiere body según tu comentario. */
    approve: (requestId: number | string) =>
        apiFetch<void>(`/business-requests/${requestId}/approve`, {
            method: "POST",
            auth: true,
        }),

    /** Rechaza una solicitud (admin). Sin body (si luego agregas razón, se puede extender). */
    reject: (requestId: number | string) =>
        apiFetch<void>(`/business-requests/${requestId}/reject`, {
            method: "POST",
            auth: true,
        }),

    /** Lista solicitudes (admin) */
    list: (params?: BRListParams) =>
        apiFetch<BusinessRequestItem[]>(
            `/business-requests${toQuery(params as any)}`,
            { method: "GET", auth: true }
        ),
};

export default BusinessRequestsService;