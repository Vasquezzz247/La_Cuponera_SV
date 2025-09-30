// src/services/auth.ts
import { apiFetch } from "@/lib/http";
import { authToken } from "@/lib/auth";

// Ajusta los campos segun tu API exacta
export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

type LoginResponse = {
    access_token: string;    // ajusta si tu API usa otro nombre
    token_type?: string;
    expires_in?: number;
    user?: unknown;
};

export async function registerUser(payload: RegisterPayload) {
    // POST /register
    // Si tu API devuelve token al registrarse, lo guardamos; si no, solo retornamos data.
    const data = await apiFetch<any>("/register", {
        method: "POST",
        body: payload,
    });

    if ((data as LoginResponse)?.access_token) {
        authToken.set((data as LoginResponse).access_token);
    }

    return data;
}

export async function loginUser(payload: LoginPayload) {
    // POST /login
    const data = await apiFetch<LoginResponse>("/login", {
        method: "POST",
        body: payload,
    });
    authToken.set(data.access_token);
    return data;
}

export async function logoutUser() {
    // POST /auth/logout (requiere bearer)
    await apiFetch<{}>("/auth/logout", {
        method: "POST",
        auth: true,
    });
    authToken.clear();
}
