import { useEffect, useMemo, useState } from "react";
import { Mail, RefreshCw, Search, Shield } from "lucide-react";
import type { UserItem } from "@/services/reports";
import ReportsService from "@/services/reports";

/* ------------------------------ helpers ------------------------------ */
function hasText(v?: string | null) {
    return typeof v === "string" && v.trim() !== "";
}
function fmtDate(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}
type RoleName = "admin" | "business" | "user";

function RoleChip({ name }: { name: string }) {
    const n = (name || "").toLowerCase();
    const base =
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1";
    if (n === "admin")
        return <span className={`${base} bg-purple-50 text-purple-700 ring-purple-200`}>admin</span>;
    if (n === "business")
        return <span className={`${base} bg-blue-50 text-blue-700 ring-blue-200`}>business</span>;
    return <span className={`${base} bg-emerald-50 text-emerald-700 ring-emerald-200`}>user</span>;
}

function primaryRole(u: UserItem): RoleName {
    const names = (u.roles || []).map(r => (r.name || "").toLowerCase());
    if (names.includes("admin")) return "admin";
    if (names.includes("business")) return "business";
    return "user";
}

/* ------------------------------ component ------------------------------ */
export default function UsersTable() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [role, setRole] = useState<RoleName | "all">("all");

    async function load() {
        try {
            setLoading(true);
            const data = await ReportsService.getUsers();
            setUsers(Array.isArray(data) ? data : []);
            setError(null);
        } catch (e: any) {
            setError(e?.message ?? "Error cargando usuarios");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        return (users ?? []).filter((u) => {
            const matchesText =
                !term ||
                (u.name && u.name.toLowerCase().includes(term)) ||
                (u.email && u.email.toLowerCase().includes(term));
            const roles = (u.roles || []).map((r) => (r.name || "").toLowerCase());
            const matchesRole = role === "all" || roles.includes(role);
            return matchesText && matchesRole;
        });
    }, [users, q, role]);

    async function changeRole(u: UserItem, to: RoleName) {
        try {
            // confirmación simple
            const ok = window.confirm(
                `¿Confirmas cambiar el rol de "${u.name || u.email}" a "${to}"?`
            );
            if (!ok) return;

            await ReportsService.changeUserRole(u.id!, to);

            // Optimistic update: dejamos un solo rol con el destino
            setUsers((prev) =>
                prev.map((x) =>
                    x.id === u.id ? { ...x, roles: [{ id: `${to}`, name: to } as any] } : x
                )
            );
        } catch (e: any) {
            alert(e?.message ?? "No se pudo cambiar el rol.");
        }
    }

    // Botones según reglas:
    function RoleActions({ user }: { user: UserItem }) {
        const current = primaryRole(user);

        // Reglas:
        // business -> user
        // user     -> admin
        // admin    -> user
        if (current === "business") {
            return (
                <button
                    onClick={() => changeRole(user, "user")}
                    className="rounded-lg border px-3 py-1.5 text-xs sm:text-sm hover:bg-gray-50"
                    title="Bajar a User"
                >
                    Bajar a User
                </button>
            );
        }
        if (current === "user") {
            return (
                <button
                    onClick={() => changeRole(user, "admin")}
                    className="rounded-lg border px-3 py-1.5 text-xs sm:text-sm hover:bg-gray-50"
                    title="Hacer Admin"
                >
                    Hacer Admin
                </button>
            );
        }
        // current === "admin"
        return (
            <button
                onClick={() => changeRole(user, "user")}
                className="rounded-lg border px-3 py-1.5 text-xs sm:text-sm hover:bg-gray-50"
                title="Bajar a User"
            >
                Bajar a User
            </button>
        );
    }

    return (
        <section className="mt-2">
            {/* Filtros */}
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full items-center gap-2 sm:max-w-xl">
                    <div className="relative w-full">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Buscar por nombre o email…"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>
                    <select
                        className="rounded-xl border border-gray-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        title="Filtrar por rol"
                    >
                        <option value="all">Todos</option>
                        <option value="admin">Admin</option>
                        <option value="business">Business</option>
                        <option value="user">User</option>
                    </select>
                </div>

                <button
                    onClick={load}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                    title="Recargar"
                >
                    <RefreshCw className="h-4 w-4" />
                    Recargar
                </button>
            </div>

            {/* Estados */}
            {loading ? (
                <div className="rounded-2xl border bg-white p-6 text-gray-500">Cargando usuarios…</div>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl border bg-white p-6 text-gray-500">
                    No hay usuarios que coincidan con el filtro.
                </div>
            ) : (
                /* === Tarjetas (mismo estilo que las solicitudes) con acciones === */
                <div className="mt-1 space-y-3">
                    {filtered.map((u) => {
                        const roles = u.roles || [];
                        return (
                            <div
                                key={u.id}
                                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                            >
                                {/* Encabezado compacto */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    {/* Nombre + correo */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                            <Shield className="h-4 w-4 text-emerald-600" />
                                            <span className="truncate">{u.name || "—"}</span>
                                        </div>

                                        {hasText(u.email) && (
                                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                <Mail className="h-3.5 w-3.5" />
                                                <span className="truncate">{u.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Chips: roles + fecha + acciones */}
                                    <div className="flex shrink-0 items-center gap-2">
                                        <div className="flex flex-wrap items-center gap-1">
                                            {roles.length ? (
                                                roles.map((r) => (
                                                    <RoleChip key={`${u.id}-${r.id || r.name}`} name={r.name || ""} />
                                                ))
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                                                    sin rol
                                                </span>
                                            )}
                                        </div>
                                        <span className="hidden rounded-lg border px-2.5 py-1 text-xs text-gray-500 sm:inline">
                                            {fmtDate(u.created_at)}
                                        </span>
                                        {/* Acción de cambio de rol */}
                                        <RoleActions user={u} />
                                    </div>
                                </div>

                                {/* Fecha (solo mobile) */}
                                <div className="mt-2 flex items-center justify-between sm:hidden">
                                    <span className="text-xs text-gray-500">Creado: {fmtDate(u.created_at)}</span>
                                    <RoleActions user={u} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
