// src/services/password.ts
import { apiFetch } from "@/lib/http";

/** Paso 1: solicitar token de reseteo (manda email) */
export async function requestPasswordReset(email: string) {
    // POST /password/forgot
    // backend envía correo con el token (o lo loguea si usas MAIL_MAILER=log)
    return apiFetch<{ message: string }>("/password/forgot", {
        method: "POST",
        body: { email },
    });
}

/** Paso 2: resetear contraseña con token (enlace del email) */
export type ResetPasswordPayload = {
    email: string;
    token: string; // viene en el correo (query o cuerpo)
    password: string;
    password_confirmation: string;
};

export async function resetPassword(payload: ResetPasswordPayload) {
    // POST /password/reset
    return apiFetch<{ message: string }>("/password/reset", {
        method: "POST",
        body: payload,
    });
}

/** Cambio de contraseña autenticado (perfil -> Seguridad) */
export type ChangePasswordPayload = {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
};

export async function changePassword(payload: ChangePasswordPayload) {
    // POST /password/change (requiere Authorization: Bearer)
    return apiFetch<{ message: string }>("/password/change", {
        method: "POST",
        auth: true,
        body: payload,
    });
}

/** Helper: leer email y token desde la URL (?email=...&token=...) */
export function getResetParamsFromQuery(search = window.location.search) {
    const params = new URLSearchParams(search);
    const email = params.get("email") ?? undefined;
    const token = params.get("token") ?? undefined;
    return { email, token };
}
