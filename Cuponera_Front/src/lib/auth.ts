// src/lib/auth.ts
const TOKEN_KEY = "auth_token";

export const authToken = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
    clear: () => localStorage.removeItem(TOKEN_KEY),
};