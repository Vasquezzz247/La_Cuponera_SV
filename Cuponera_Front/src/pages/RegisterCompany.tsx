import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/http";

type CompanyRegisterPayload = {
    company_name: string;
    company_nit: string;
    company_email: string;
    company_phone: string;
    company_address: string;
    company_description: string;
    platform_fee_percent: number;
};

export default function RegisterCompany() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<CompanyRegisterPayload>({
        company_name: "",
        company_nit: "",
        company_email: "",
        company_phone: "",
        company_address: "",
        company_description: "",
        platform_fee_percent: 15,
    });

    function update<K extends keyof CompanyRegisterPayload>(key: K, value: CompanyRegisterPayload[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!form.company_name || !form.company_email || !form.company_nit) {
            setError("Nombre, NIT y correo son obligatorios.");
            return;
        }
        if (form.platform_fee_percent < 0 || form.platform_fee_percent > 100) {
            setError("La comisión debe estar entre 0 y 100%.");
            return;
        }

        setLoading(true);
        try {
            // Ajusta la ruta al endpoint real de tu API (ej. /business/register o /companies)
            await apiFetch("/companies", {
                method: "POST",
                body: form,
            });
            navigate("/login"); // o donde prefieras redirigir tras registrar
        } catch (err: any) {
            setError(err.message || "Error al registrar la empresa");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <section className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold">Registrar empresa</h2>
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

                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">Nombre de la empresa</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.company_name}
                            onChange={(e) => update("company_name", e.target.value)}
                            placeholder="Panadería La Espiga"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">NIT</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.company_nit}
                            onChange={(e) => update("company_nit", e.target.value)}
                            placeholder="0614-050190-101-3"
                            pattern="^\d{4}-\d{6}-\d{3}-\d{1}$"
                            title="Formato: 0000-000000-000-0"
                            inputMode="numeric"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Correo de la empresa</label>
                        <input
                            type="email"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.company_email}
                            onChange={(e) => update("company_email", e.target.value)}
                            placeholder="espiga@empresa.com"
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Teléfono</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.company_phone}
                            onChange={(e) => update("company_phone", e.target.value)}
                            placeholder="2222-3333"
                            pattern="^\d{4}-\d{4}$"
                            title="Formato: 0000-0000"
                            inputMode="numeric"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Comisión de plataforma (%)</label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.platform_fee_percent}
                            onChange={(e) => update("platform_fee_percent", Number(e.target.value))}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">Dirección</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.company_address}
                            onChange={(e) => update("company_address", e.target.value)}
                            placeholder="Av. Siempre Viva #123"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">Descripción</label>
                        <textarea
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            rows={4}
                            value={form.company_description}
                            onChange={(e) => update("company_description", e.target.value)}
                            placeholder="Pan artesanal y repostería."
                        />
                    </div>

                    <div className="md:col-span-2 mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-emerald-700 text-white py-2.5 hover:bg-emerald-800 disabled:opacity-60"
                        >
                            {loading ? "Registrando..." : "Registrar empresa"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
