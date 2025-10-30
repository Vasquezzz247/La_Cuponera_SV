// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { apiFetch } from "../lib/http";
import { requestPasswordReset } from "@/services/password";

type LoginResponse = {
    token?: string;
    access_token?: string;
    user?: unknown;
};

type MeResponse = {
    roles?: Array<{ id: number | string; name: string }> | string[] | string;
    [k: string]: any;
};

// --- Helpers ---
function normalizeToken(raw?: string | null): string | null {
    if (!raw) return null;
    return raw.startsWith("Bearer ") ? raw.slice(7) : raw;
}

function parseJwt(token: string): any | null {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

function hasAdminRoleFromAny(payload: any): boolean {
    if (!payload) return false;
    const roles = new Set<string>();

    const add = (v: any) => {
        if (!v) return;
        if (typeof v === "string") {
            v
                .split(/[,\s]+/)
                .filter(Boolean)
                .forEach((r) => roles.add(r.toLowerCase()));
        } else if (Array.isArray(v)) {
            v.forEach((r) => {
                if (typeof r === "string") roles.add(r.toLowerCase());
                else if (r && typeof r.name === "string") roles.add(r.name.toLowerCase());
            });
        } else if (typeof v === "object" && typeof v.name === "string") {
            roles.add(v.name.toLowerCase());
        }
    };

    add(payload.roles);
    add(payload.role);
    add(payload.scope);
    add(payload.scopes);

    return roles.has("admin");
}

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const prefill = (location.state as any)?.emailPrefill ?? "";
    const registered = (location.state as any)?.registered ?? false;

    const [email, setEmail] = useState(prefill);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(
        registered ? "Cuenta creada correctamente. Ahora inicia sesión." : null
    );

    // --- Forgot password UI state ---
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState(prefill || "");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotOk, setForgotOk] = useState<string | null>(null);
    const [forgotErr, setForgotErr] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setOk(null);

        if (!email || !password) {
            setError("Ingresa tu correo y contraseña.");
            return;
        }

        setLoading(true);
        try {
            // Login
            const data = await apiFetch<LoginResponse>("/login", {
                method: "POST",
                body: { email, password },
            });

            // Guarda token
            const rawToken = data.token ?? data.access_token ?? null;
            const token = normalizeToken(rawToken);
            if (token) localStorage.setItem("auth_token", token);

            // 1) Intento directo: roles en el JWT
            if (token) {
                const payload = parseJwt(token);
                if (hasAdminRoleFromAny(payload)) {
                    navigate("/admin-portal", { replace: true });
                    return;
                }
            }

            // 2) Fallback: roles desde /me
            if (token) {
                try {
                    const me = await apiFetch<MeResponse>("/me", { method: "GET", auth: true });
                    const isAdmin = hasAdminRoleFromAny({ roles: me?.roles });
                    if (isAdmin) {
                        navigate("/admin-portal", { replace: true });
                        return;
                    }
                } catch {
                    // ignore
                }
            }

            navigate("/", { replace: true });
        } catch (err: any) {
            setError(err.message || "Error de autenticación");
        } finally {
            setLoading(false);
        }
    }

    async function handleForgot() {
        setForgotErr(null);
        setForgotOk(null);

        if (!forgotEmail) {
            setForgotErr("Ingresa tu correo.");
            return;
        }

        setForgotLoading(true);
        try {
            await requestPasswordReset(forgotEmail);
            setForgotOk(
                "Si el correo existe, te enviamos un enlace con instrucciones. Revisa tu bandeja y SPAM."
            );
        } catch (err: any) {
            setForgotErr(err.message || "No se pudo iniciar el proceso de recuperación.");
        } finally {
            setForgotLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <section className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold">Iniciar Sesión</h2>
                    <p className="text-gray-600">Accede a tu cuenta para gestionar tus ofertas.</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow p-10 space-y-8 min-h-96 flex flex-col justify-center"
                >
                    {ok && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{ok}</div>}
                    {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Contraseña</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-emerald-700 text-white py-2.5 hover:bg-emerald-800 disabled:opacity-60"
                    >
                        {loading ? "Ingresando..." : "Entrar"}
                    </button>

                    {/* Toggle forgot */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setShowForgot((v) => !v)}
                            className="text-sm text-emerald-700 hover:underline"
                        >
                            {showForgot ? "Ocultar recuperación" : "¿Olvidaste tu contraseña?"}
                        </button>
                    </div>

                    {/* Forgot panel (sin form anidado) */}
                    {showForgot && (
                        <div className="rounded-xl border p-4 space-y-3 bg-gray-50">
                            <p className="text-sm text-gray-700">
                                Te enviaremos un correo con un enlace para restablecer tu contraseña.
                            </p>

                            {forgotOk && (
                                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{forgotOk}</div>
                            )}
                            {forgotErr && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{forgotErr}</div>
                            )}

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm mb-1">Correo de tu cuenta</label>
                                    <input
                                        type="email"
                                        className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                        placeholder="tu@correo.com"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        autoComplete="email"
                                        disabled={forgotLoading}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleForgot}
                                    disabled={forgotLoading}
                                    className="w-full rounded-xl bg-emerald-700 text-white py-2 hover:bg-emerald-800 disabled:opacity-60"
                                >
                                    {forgotLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                                </button>

                                <p className="text-xs text-gray-600 text-center">
                                    Cuando te llegue el correo, el enlace abrirá la pantalla de{" "}
                                    <Link to="/reset-password" className="text-emerald-700 hover:underline">
                                        Restablecer contraseña
                                    </Link>
                                    .
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-center text-gray-600">
                        ¿No tienes cuenta?{" "}
                        <Link to="/register" className="text-emerald-700 hover:underline">
                            Regístrate
                        </Link>
                    </p>
                </form>
            </section>
        </div>
    );
}
