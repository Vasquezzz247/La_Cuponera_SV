// src/services/reports.ts
import { apiFetch } from "@/lib/http";

/**
 * Estructura devuelta por GET /admin/reports/companies
 */
export type CompanyReport = {
    business_id: number;
    business_name: string;
    coupons_sold: number;
    gross_sales: string;      // viene como string numérica
    platform_gain: string;    // ganancia para la plataforma
    business_gain: string;    // ganancia para el negocio
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
 * Servicio de reportes administrativos
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
};

export default ReportsService;