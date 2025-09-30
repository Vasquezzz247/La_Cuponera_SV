import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { apiFetch } from "../lib/http";

type LoginResponse = {
    token?: string;
    access_token?: string;
    user?: unknown;
};

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    // Si vienes de register, prefill email
    const prefill = (location.state as any)?.emailPrefill ?? "";
    const registered = (location.state as any)?.registered ?? false;

    const [email, setEmail] = useState(prefill);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(registered ? "Cuenta creada correctamente. Ahora inicia sesión." : null);

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
            // 🚀 RUTA LOGIN: /login (ajusta si tu backend usa /auth/login)
            const data = await apiFetch<LoginResponse>("/login", {
                method: "POST",
                body: { email, password },
            });

            const token = data.token ?? data.access_token;
            if (token) localStorage.setItem("auth_token", token);

            // Redirect a landing page
            navigate("/", { replace: true });
        } catch (err: any) {
            setError(err.message || "Error de autenticación");
        } finally {
            setLoading(false);
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
                    {ok && (
                        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{ok}</div>
                    )}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
                    )}

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
