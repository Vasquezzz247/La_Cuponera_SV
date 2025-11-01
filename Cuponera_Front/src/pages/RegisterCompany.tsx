import { useState } from "react";
import { useNavigate } from "react-router-dom";
//import { apiFetch } from "../lib/http";
import BusinessRequestService, { type CreateBusinessRequestPayload } from "@/services/businessRequests";

type CompanyRegisterPayload = {
    company_name: string;      // ####-######-###-#
    company_nit: string;
    company_email: string;
    company_phone: string;     // ####-####
    company_address: string;
    company_description: string;
    platform_fee_percent: number;
};

// -------------------- helpers: máscara y validaciones --------------------
const onlyDigits = (s: string) => s.replace(/\D+/g, "");

// NIT: 4-6-3-1  => ####-######-###-#
function formatNIT(input: string) {
    const d = onlyDigits(input).slice(0, 4 + 6 + 3 + 1); // 14 dígitos máx
    const p1 = d.slice(0, 4);
    const p2 = d.slice(4, 10);
    const p3 = d.slice(10, 13);
    const p4 = d.slice(13, 14);
    let out = p1;
    if (p2) out += "-" + p2;
    if (p3) out += "-" + p3;
    if (p4) out += "-" + p4;
    return out;
}

function isValidNIT(nit: string) {
    return /^\d{4}-\d{6}-\d{3}-\d{1}$/.test(nit);
}

// Teléfono: ####-####
function formatPhone(input: string) {
    const d = onlyDigits(input).slice(0, 8); // 8 dígitos máx
    const p1 = d.slice(0, 4);
    const p2 = d.slice(4, 8);
    return p2 ? `${p1}-${p2}` : p1;
}

function isValidPhone(ph: string) {
    return /^\d{4}-\d{4}$/.test(ph);
}

function allowControlKey(e: React.KeyboardEvent<HTMLInputElement>) {
    const k = e.key;
    return (
        k === "Backspace" ||
        k === "Delete" ||
        k === "ArrowLeft" ||
        k === "ArrowRight" ||
        k === "Tab" ||
        k === "Home" ||
        k === "End"
    );
}

// ------------------------------------------------------------------------

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

        if (!form.company_name.trim()) return setError("El nombre es obligatorio.");
        if (!isValidNIT(form.company_nit)) return setError("El NIT no tiene un formato válido (####-######-###-#).");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.company_email)) return setError("El correo no es válido.");
        if (!isValidPhone(form.company_phone)) return setError("El teléfono no tiene un formato válido (0000-0000).");
        if (form.platform_fee_percent < 0 || form.platform_fee_percent > 100)
            return setError("La comisión debe estar entre 0% y 100%.");

        setLoading(true);
        try {
            const payload: CreateBusinessRequestPayload = {
                company_name: form.company_name,
                company_nit: form.company_nit,
                company_email: form.company_email,
                company_phone: form.company_phone,
                company_address: form.company_address,
                company_description: form.company_description,
                platform_fee_percent: form.platform_fee_percent,
            };

            await BusinessRequestService.create(payload);

            // Mensaje de confirmación SIEMPRE antes de redirigir
            alert("✅ Tu solicitud de negocio fue enviada con éxito. Te contactaremos pronto.");
            // Redirigir a la ruta base
            navigate("/", { replace: true });
        } catch (err: any) {
            // No redirigir en error
            setError(err?.message || "Error al enviar la solicitud de negocio");
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

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 grid md:grid-cols-2 gap-4">
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
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">NIT</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.company_nit}
                            onChange={(e) => update("company_nit", formatNIT(e.target.value))}
                            onKeyDown={(e) => {
                                if (!allowControlKey(e) && !/^\d$/.test(e.key)) e.preventDefault();
                            }}
                            onPaste={(e) => {
                                e.preventDefault();
                                const pasted = (e.clipboardData || (window as any).clipboardData).getData("text");
                                update("company_nit", formatNIT(pasted));
                            }}
                            placeholder="0614-050190-101-3"
                            inputMode="numeric"
                            maxLength={17} // 4+1+6+1+3+1+1
                            pattern="^\d{4}-\d{6}-\d{3}-\d{1}$"
                            title="Formato: 0000-000000-000-0"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">Se formatea automáticamente mientras escribes.</p>
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
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Teléfono</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.company_phone}
                            onChange={(e) => update("company_phone", formatPhone(e.target.value))}
                            onKeyDown={(e) => {
                                if (!allowControlKey(e) && !/^\d$/.test(e.key)) e.preventDefault();
                            }}
                            onPaste={(e) => {
                                e.preventDefault();
                                const pasted = (e.clipboardData || (window as any).clipboardData).getData("text");
                                update("company_phone", formatPhone(pasted));
                            }}
                            placeholder="2222-3333"
                            inputMode="numeric"
                            maxLength={9} // 4+1+4
                            pattern="^\d{4}-\d{4}$"
                            title="Formato: 0000-0000"
                            required
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
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">Dirección</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            value={form.company_address}
                            onChange={(e) => update("company_address", e.target.value)}
                            placeholder="Av. Siempre Viva #123"
                            required
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
                            required
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
