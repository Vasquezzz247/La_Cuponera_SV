// src/services/reports.ts
import { apiFetch } from "@/lib/http";


export type CompanyReport = {
    business_id: number;
    business_name: string;
    coupons_sold: number;
    gross_sales: string;
    platform_gain: string;
    business_gain: string;
};

/** Representación de usuario con rol */
export type UserItem = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    roles: { id: number; name: string }[];
};

/** Payload para cambiar rol */
export type ChangeRolePayload = {
    role: "user" | "admin" | "business";
};

/** Respuesta al cambiar rol */
export type ChangeRoleResponse = {
    message: string;
    user: {
        id: number;
        email: string;
        roles: string[];
    };
};

/** Filtros opcionales (si tu backend los acepta en querystring) */
export type ReportFilters = {
    start_date?: string; // formato "YYYY-MM-DD"
    end_date?: string;
    q?: string;
};

/** Helper para querystring */
function toQuery(params?: Record<string, string | number | boolean | undefined>) {
    if (!params) return "";
    const pairs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return pairs.length ? `?${pairs.join("&")}` : "";
}

/**
 * Servicio de reportes y administración (admin)
 */
export const ReportsService = {
    /**
     * Reporte de ventas por empresa
     * GET /admin/reports/companies
     */
    getCompanies: (filters?: ReportFilters) =>
        apiFetch<CompanyReport[]>(`/admin/reports/companies${toQuery(filters as any)}`, {
            method: "GET",
            auth: true,
        }),

    /**
     * Listado de usuarios
     * GET /users
     */
    getUsers: () =>
        apiFetch<UserItem[]>(`/users`, {
            method: "GET",
            auth: true,
        }),

    /**
     * Cambiar rol de un usuario
     * POST /admin/users/{id}/role
     */
    changeUserRole: (userId: number | string, role: ChangeRolePayload["role"]) =>
        apiFetch<ChangeRoleResponse>(`/admin/users/${userId}/role`, {
            method: "POST",
            auth: true,
            body: { role },
        }),
};

export default ReportsService;