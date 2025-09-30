import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/http";

type RegisterPayload = {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    name: string;
    last_name: string;
    dui: string; // "########-#"
    date_of_birth: string; // "YYYY-MM-DD"
};

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState<RegisterPayload>({
        username: "",
        email: "",
        password: "",
        password_confirmation: "",
        name: "",
        last_name: "",
        dui: "",
        date_of_birth: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    function update<K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    // Valida DUI "########-#"
    function isValidDUI(v: string) {
        return /^\d{8}-\d$/.test(v);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setOk(null);

        if (form.password !== form.password_confirmation) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (!form.email || !form.username || !form.name || !form.last_name) {
            setError("Completa todos los campos obligatorios.");
            return;
        }

        if (!isValidDUI(form.dui)) {
            setError("El DUI debe tener el formato ########-# (9 dígitos con guion).");
            return;
        }

        setLoading(true);
        try {
            await apiFetch<unknown>("/register", {
                method: "POST",
                body: form,
            });

            // Confirmación visual
            setOk("Registro exitoso. Te estamos redirigiendo al inicio de sesión…");

            // Redirige al login con prefill
            setTimeout(() => {
                navigate("/login", { replace: true, state: { emailPrefill: form.email, registered: true } });
            }, 1200);
        } catch (err: any) {
            setError(err.message || "Error al registrar");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <section className="max-w-2xl mx-auto w-full">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold">Crear cuenta</h2>
                    <p className="text-gray-600">Únete y promociona tus ofertas en La Cuponera SV.</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow p-6 grid md:grid-cols-2 gap-4"
                >
                    {error && (
                        <div className="md:col-span-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    {ok && (
                        <div className="md:col-span-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
                            {ok}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm mb-1">Usuario</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.username}
                            onChange={(e) => update("username", e.target.value)}
                            placeholder="juan233"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            placeholder="juan@correo.com"
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Nombre</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                            placeholder="Juan"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Apellidos</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.last_name}
                            onChange={(e) => update("last_name", e.target.value)}
                            placeholder="Pérez López"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">DUI</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.dui}
                            onChange={(e) => {
                                // Solo números y límite de 9 dígitos
                                let raw = e.target.value.replace(/\D/g, "").slice(0, 9);
                                if (raw.length === 9) raw = raw.slice(0, 8) + "-" + raw.slice(8);
                                update("dui", raw);
                            }}
                            placeholder="01234567-1"
                            maxLength={10} // 9 dígitos + guion
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Fecha de nacimiento</label>
                        <input
                            type="date"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.date_of_birth}
                            onChange={(e) => update("date_of_birth", e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Contraseña</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.password}
                            onChange={(e) => update("password", e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Confirmar contraseña</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.password_confirmation}
                            onChange={(e) => update("password_confirmation", e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            disabled={loading}
                        />
                    </div>

                    <div className="md:col-span-2 mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-emerald-700 text-white py-2.5 hover:bg-emerald-800 disabled:opacity-60"
                        >
                            {loading ? "Creando cuenta..." : "Crear cuenta"}
                        </button>
                    </div>

                    <p className="md:col-span-2 text-sm text-center text-gray-600">
                        ¿Ya tienes cuenta?{" "}
                        <Link to="/login" className="text-emerald-700 hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </form>
            </section>
        </div>
    );
}
