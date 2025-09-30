// src/lib/http.ts
export const API_URL = import.meta.env.VITE_API_URL as string;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiFetch<T>(
    path: string,
    options: { method?: HttpMethod; body?: unknown; auth?: boolean } = {}
): Promise<T> {
    const { method = "GET", body, auth = false } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",   
    };

    if (auth) {
        const token = localStorage.getItem("auth_token");
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        // intenta extraer mensaje util de error
        let message = `HTTP ${res.status}`;
        try {
            const data = await res.json();
            if (typeof data?.message === "string") message = data.message;
            else if (data?.errors && typeof data.errors === "object") {
                // une errores de validación (Laravel 422)
                const flat = Object.values<string[] | string>(data.errors)
                    .flat()
                    .join(" ");
                if (flat) message = flat;
            }
        } catch {
            // si no es JSON, intenta leer texto
            const text = await res.text().catch(() => "");
            if (text) message = text;
        }
        throw new Error(message);
    }

    // 204 No Content
    if (res.status === 204) return {} as T;

    return (await res.json()) as T;
}
