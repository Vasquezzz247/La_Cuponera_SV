// src/pages/ResetPassword.tsx
import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { resetPassword } from "@/services/password";

type ResetPasswordPayload = {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const emailParam = params.get("email") || "";
    const tokenParam = params.get("token") || "";

    const [email, setEmail] = useState(emailParam);
    const [token, setToken] = useState(tokenParam);
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [ok, setOk] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setOk(null);

        if (!email || !token || !password || !passwordConfirm) {
            setErr("Completa todos los campos.");
            return;
        }

        if (password !== passwordConfirm) {
            setErr("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            await resetPassword({ email, token, password, password_confirmation: passwordConfirm });
            setOk("Contraseña restablecida correctamente. Ahora puedes iniciar sesión.");
            setTimeout(() => navigate("/login", { replace: true }), 2000);
        } catch (e: any) {
            setErr(e.message || "No se pudo restablecer la contraseña.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <section className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold">Restablecer Contraseña</h2>
                    <p className="text-gray-600">
                        Ingresa tu nueva contraseña para acceder a tu cuenta.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow p-10 space-y-8 flex flex-col justify-center"
                >
                    {ok && (
                        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{ok}</div>
                    )}
                    {err && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{err}</div>}

                    <div>
                        <label className="block text-sm mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            disabled={!!emailParam || loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Token</label>
                        <input
                            type="text"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Token recibido por correo"
                            disabled={!!tokenParam || loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Nueva contraseña</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            autoComplete="new-password"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Confirmar contraseña</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="********"
                            autoComplete="new-password"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-emerald-700 text-white py-2 hover:bg-emerald-800 disabled:opacity-60"
                    >
                        {loading ? "Guardando..." : "Restablecer contraseña"}
                    </button>

                    <p className="text-sm text-center text-gray-600">
                        ¿Recordaste tu contraseña?{" "}
                        <Link to="/login" className="text-emerald-700 hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </form>
            </section>
        </div>
    );
}
