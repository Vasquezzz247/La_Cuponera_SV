// src/pages/admin/AdminDashboardPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck,
    Clock3,
    Building2,
    Users,
    CheckCircle2,
    Search,
    Plus,
    X,
    Mail,
    ChevronDown,
    LogOut,
    Home,
} from "lucide-react";

import Sidebar from "@/components/portal/Sidebar";
import TopBar from "@/components/portal/TopBar";
import StatCard from "@/components/portal/StatCard";
import SectionTitle from "@/components/portal/SectionTitle";
import EmptyState from "@/components/portal/EmptyState";
import BusinessRequestsService, {
    type BusinessRequestItem as BRItem,
} from "@/services/businessRequests";
import AccountService, {
    type MeResponse,
    getDisplayName,
} from "@/services/account";

/* -------------------------- UserMenu -------------------------- */
function UserMenu({
    name,
    email,
    onLogout,
    onExit,
}: {
    name: string;
    email?: string;
    onLogout: () => Promise<void> | void;
    onExit: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const initials = (name || "A").slice(0, 1).toUpperCase();

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 rounded-lg border bg-white px-2.5 py-2 hover:bg-gray-50 sm:px-3"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white">
                    {initials}
                </div>
                <div className="hidden text-left sm:block">
                    <div className="text-sm font-medium text-gray-900">{name}</div>
                    {email ? <div className="text-xs text-gray-500">{email}</div> : null}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                >
                    <button
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        onClick={onExit}
                    >
                        <Home className="h-4 w-4" />
                        Ir al inicio
                    </button>
                    <button
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        onClick={onLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
}

/* ---------------------- MOCK (solo KPIs por ahora) ---------------------- */
type MiniEntity = {
    id: number;
    name: string;
    type: "business" | "offer" | "user" | "category";
    status: "approved" | "pending" | "disabled";
};

const MOCK_ENTITIES: MiniEntity[] = [
    { id: 1, name: "Restaurante El Buen Sabor", type: "business", status: "approved" },
    { id: 2, name: "2x1 en Hamburguesas", type: "offer", status: "approved" },
    { id: 3, name: "50% Spa Relax", type: "offer", status: "pending" },
    { id: 4, name: "Zapatería Los Hermanos", type: "business", status: "pending" },
    { id: 5, name: "Categoría: Belleza", type: "category", status: "approved" },
    { id: 6, name: "Juan Pérez", type: "user", status: "approved" },
    { id: 7, name: "Café Barista", type: "business", status: "disabled" },
];

/* ------------------------------ utils ------------------------------ */
function fmtDate(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}
function hasText(v?: string | null) {
    return typeof v === "string" && v.trim() !== "";
}
/** Convierte seguro a número (maneja string/undefined/null). */
function num(v: unknown, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}
function isRenderablePending(r?: BRItem | null): r is BRItem {
    if (!r) return false;
    const pending = String(r.status).toLowerCase() === "pending";
    const visible =
        hasText(r.company_name) ||
        hasText(r.company_email) ||
        hasText(r.user?.name) ||
        hasText(r.user?.email);
    return pending && visible;
}

/* ---------------------------------- page ---------------------------------- */
export default function AdminDashboardPage() {
    const navigate = useNavigate();

    // Me (para mostrar nombre/correo en el menú)
    const [me, setMe] = useState<MeResponse | null>(null);
    const [loadingMe, setLoadingMe] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await AccountService.me();
                setMe(data);
            } finally {
                setLoadingMe(false);
            }
        })();
    }, []);

    const displayName = loadingMe ? "Cargando…" : getDisplayName(me);

    async function handleLogout() {
        localStorage.removeItem("auth_token");
        navigate("/", { replace: true });
    }

    // -------- Solicitudes (admin) --------
    const [requests, setRequests] = useState<BRItem[]>([]);
    const [loadingReq, setLoadingReq] = useState<boolean>(true);
    const [errorReq, setErrorReq] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoadingReq(true);
                const data = await BusinessRequestsService.list();
                setRequests(Array.isArray(data) ? (data as BRItem[]) : []);
            } catch (e: any) {
                setErrorReq(e?.message ?? "Error cargando solicitudes");
            } finally {
                setLoadingReq(false);
            }
        })();
    }, []);

    // SOLO pendientes y con datos visibles (y sin nulos/duplicados)
    const rows = useMemo(() => {
        const arr = (requests ?? []).filter(isRenderablePending);
        const seen = new Set<string>();
        return arr.filter((r) => {
            const key = String(r.id);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [requests]);

    async function onApprove(id: number | string) {
        const ok = window.confirm("¿Aprobar esta solicitud? El usuario recibirá rol business.");
        if (!ok) return;
        try {
            await BusinessRequestsService.approve(id);
            setRequests((prev) => prev.filter((r) => String(r.id) !== String(id)));
        } catch (e: any) {
            alert(e?.message ?? "No se pudo aprobar la solicitud.");
        }
    }

    async function onReject(id: number | string) {
        const ok = window.confirm("¿Rechazar esta solicitud?");
        if (!ok) return;
        try {
            await BusinessRequestsService.reject(id);
            setRequests((prev) => prev.filter((r) => String(r.id) !== String(id)));
        } catch (e: any) {
            alert(e?.message ?? "No se pudo rechazar la solicitud.");
        }
    }

    // KPIs (mock)
    const kpis = useMemo(() => {
        const offers = MOCK_ENTITIES.filter((e) => e.type === "offer");
        const activeOffers = offers.filter((e) => e.status === "approved").length;
        const pending = offers.filter((e) => e.status === "pending").length;
        const verified = MOCK_ENTITIES.filter(
            (e) => e.type === "business" && e.status === "approved"
        ).length;
        const users = MOCK_ENTITIES.filter((e) => e.type === "user").length;
        return { activeOffers, pending, verified, users };
    }, []);


    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                brand={{
                    icon: ShieldCheck,
                    title: "Admin Panel",
                    subtitle: "La Cuponera SV",
                    iconBgClass: "from-emerald-600 to-emerald-700",
                }}
                items={[
                    { id: "dashboard", label: "Dashboard", icon: CheckCircle2 },
                    { id: "users", label: "Usuarios", icon: Users },
                ]}
                activeId="dashboard"
                onSelect={(id) => {
                    const routes: Record<string, string> = {
                        dashboard: "/admin",
                        moderation: "/admin/moderation",
                        business: "/admin/business",
                        users: "/admin/users",
                        categories: "/admin/categories",
                        settings: "/admin/settings",
                    };
                    navigate(routes[id] ?? "/admin");
                }}
            />

            {/* Content */}
            <div className="lg:pl-64">
                <TopBar
                    title="Dashboard"
                    rightExtra={
                        <UserMenu
                            name={displayName || "Admin"}
                            email={me?.email}
                            onLogout={handleLogout}
                            onExit={() => navigate("/", { replace: true })}
                        />
                    }
                />

                <main className="mx-auto max-w-7xl p-4 lg:p-6">
                    <p className="text-gray-500 -mt-1 mb-5">
                        Monitorea el estado de las ofertas y usuarios activos
                    </p>

                    {/* KPIs */}
                    <SectionTitle title="Resumen general" />
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Ofertas Activas"
                            subtitle="Aprobadas y vigentes"
                            value={kpis.activeOffers}
                            icon={CheckCircle2}
                            accent="emerald"
                        />
                        <StatCard
                            title="Pendientes Aprobación"
                            subtitle="Requieren moderación"
                            value={kpis.pending}
                            icon={Clock3}
                            accent="orange"
                        />
                        <StatCard
                            title="Empresas Verificadas"
                            subtitle="Cuentas activas"
                            value={kpis.verified}
                            icon={Building2}
                            accent="blue"
                        />
                        <StatCard
                            title="Usuarios Registrados"
                            subtitle="Total en la plataforma"
                            value={kpis.users}
                            icon={Users}
                            accent="purple"
                        />
                    </div>

                    {/* Solicitudes pendientes */}
                    <SectionTitle title="Solicitudes de Empresas (Pendientes)" className="mt-10" />

                    {loadingReq ? (
                        <div className="mt-3 rounded-2xl border bg-white p-6 text-gray-500">
                            Cargando solicitudes…
                        </div>
                    ) : errorReq ? (
                        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                            {errorReq}
                        </div>
                    ) : rows.length === 0 ? (
                        <EmptyState
                            icon={Search}
                            title="Sin solicitudes pendientes"
                            description="Por ahora no hay solicitudes para convertirse en empresa."
                        />
                    ) : (
                        <div className="mt-3 space-y-3">
                            {rows.map((r) => (
                                <div
                                    key={r.id}
                                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                                >
                                    {/* Encabezado compacto */}
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        {/* Empresa + contacto */}
                                        <div className="min-w-0">
                                            <div className="truncate text-base font-semibold text-gray-900">
                                                {r.company_name}
                                            </div>
                                            {hasText(r.company_email) && (
                                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <span className="truncate">{r.company_email}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Chips de estado y % */}
                                        <div className="flex shrink-0 items-center gap-2">
                                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                                                Pendiente
                                            </span>
                                            <span className="rounded-lg border px-2.5 py-1 text-xs text-gray-700">
                                                {Math.round(num(r.platform_fee_percent, 0))}%
                                            </span>
                                            <span className="hidden rounded-lg border px-2.5 py-1 text-xs text-gray-500 sm:inline">
                                                {fmtDate(r.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Solicitante + fecha en mobile */}
                                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-3">
                                        <div>
                                            <span className="block text-xs font-medium text-gray-500">
                                                Solicitante
                                            </span>
                                            <div className="truncate">
                                                {(r.user?.name || "Usuario") +
                                                    (hasText(r.user?.email) ? ` • ${r.user?.email}` : "")}
                                            </div>
                                        </div>

                                        <div className="sm:hidden">
                                            <span className="block text-xs font-medium text-gray-500">Fecha</span>
                                            <div>{fmtDate(r.created_at)}</div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="sm:col-start-3 sm:row-start-1 sm:justify-self-end">
                                            <div className="mt-2 flex items-center gap-2 sm:mt-0">
                                                <button
                                                    onClick={() => onApprove(r.id)}
                                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                                                    title="Aprobar"
                                                >
                                                    Aprobar
                                                </button>
                                                <button
                                                    onClick={() => onReject(r.id)}
                                                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                                                    title="Rechazar"
                                                >
                                                    <span className="inline-flex items-center gap-1">
                                                        <X className="h-4 w-4" /> Rechazar
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}