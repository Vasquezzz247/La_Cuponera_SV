// src/services/account.ts
import { apiFetch } from "@/lib/http";

/** ==== Tipos compartidos ==== */

export type RolePivot = {
    model_type: string; // "App\\Models\\User"
    model_id: number;
    role_id: number;
};

export type UserRole = {
    id: number;
    name: "user" | "admin" | "business" | string;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
    pivot?: RolePivot;
};

/** ==== /me ==== */
/** Respuesta exacta de GET /me según tu ejemplo */
export type MeResponse = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    password: string; // viene en la respuesta (hash), no lo usaremos
    remember_token: string | null;
    created_at: string;
    updated_at: string;
    last_name: string | null;
    dui: string | null;
    platform_fee_percent: string | null; // "50.00" como string
    username: string | null;
    date_of_birth: string | null; // ISO
    roles: UserRole[];
};

/** Helper: nombre legible para UI (puedes adaptar a lógica de empresa si la agregas después) */
export function getDisplayName(user?: Pick<MeResponse, "name" | "last_name" | "username"> | null) {
    if (!user) return "";
    if (user.username) return user.username;
    if (user.last_name) return `${user.name} ${user.last_name}`;
    return user.name;
}

/** Helper: verificar rol */
export function hasRole(roles: UserRole[] | undefined, role: string) {
    return !!roles?.some(r => r.name === role);
}

/** ==== /users ==== */
/** Ítem del listado GET /users (según ejemplo) */
export type ListedUser = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    roles: Array<
        Pick<UserRole, "id" | "name"> & {
            pivot: RolePivot;
        }
    >;
};

/** Si en el futuro soportás filtros/paginación, aquí se pueden agregar */
export type UsersListParams = {
    // page?: number;
    // per_page?: number;
    // q?: string;
};

function toQuery(params?: Record<string, string | number | boolean | undefined>) {
    if (!params) return "";
    const pairs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return pairs.length ? `?${pairs.join("&")}` : "";
}

/** ==== Servicio ==== */
export const AccountService = {
    /** GET /me (requiere auth) */
    me: () => apiFetch<MeResponse>("/me", { method: "GET", auth: true }),

    /** GET /users (requiere auth; típico de admin) */
    listUsers: (params?: UsersListParams) =>
        apiFetch<ListedUser[]>(`/users${toQuery(params as any)}`, {
            method: "GET",
            auth: true,
        }),
};

export default AccountService;