// src/pages/business/BusinessPortalPage.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Activity,
    CheckCircle2,
    Clock3,
    BadgeDollarSign,
    Plus,
    Bell,
} from "lucide-react";

import Sidebar from "@/components/portal/Sidebar";
import TopBar from "@/components/portal/TopBar";
import StatCard from "@/components/portal/StatCard";
import SectionTitle from "@/components/portal/SectionTitle";
import EmptyState from "@/components/portal/EmptyState";

// --- mock temporal ---
type MiniOffer = {
    id: number;
    title: string;
    status: "active" | "pending" | "expired";
    sold: number;
    ends_at: string;
};

const MOCK_OFFERS: MiniOffer[] = [
    { id: 101, title: "2x1 en Hamburguesas", status: "active", sold: 18, ends_at: "2025-10-11" },
    { id: 102, title: "50% Spa de Relajación", status: "active", sold: 32, ends_at: "2025-10-05" },
    { id: 103, title: "Tour Canopy -30%", status: "pending", sold: 0, ends_at: "2025-10-20" },
];

function daysLeftText(iso: string) {
    const end = new Date(iso);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Expirada";
    if (diff === 0) return "Hoy";
    if (diff === 1) return "1 día";
    return `${diff} días`;
}

export default function BusinessPortalPage() {
    const navigate = useNavigate();

    // estado UI
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        return MOCK_OFFERS.filter(
            (o) => !t || o.title.toLowerCase().includes(t) || o.status.includes(t as any),
        );
    }, [q]);

    const kpis = useMemo(() => {
        const active = MOCK_OFFERS.filter((o) => o.status === "active").length;
        const soldTotal = MOCK_OFFERS.reduce((acc, o) => acc + o.sold, 0);
        const expiring = MOCK_OFFERS.filter((o) => o.status === "active").slice(0, 1).length;
        const revenue = soldTotal * 9.5;
        return { active, soldTotal, expiring, revenue };
    }, []);

    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* SIDEBAR usando TU componente */}
            <Sidebar
                brand={{
                    icon: Activity,
                    title: "Portal Empresas",
                    subtitle: "La Cuponera SV",
                    iconBgClass: "from-emerald-500 to-emerald-600",
                }}
                items={[
                    { id: "dashboard", label: "Dashboard", icon: Activity },
                    { id: "my-offers", label: "Mis Cupones", icon: CheckCircle2 },
                    { id: "new", label: "Nuevo Cupón", icon: Plus },
                    { id: "settings", label: "Ajustes", icon: Bell },
                ]}
                activeId="dashboard"
                onSelect={(id) => {
                    const routes: Record<string, string> = {
                        dashboard: "/business-portal",
                        "my-offers": "/business-portal/offers",
                        new: "/business-portal/offers/new",
                        settings: "/business-portal/settings",
                    };
                    navigate(routes[id] ?? "/business-portal");
                }}
            />

            {/* CONTENIDO */}
            <div className="lg:pl-64">
                {/* TOPBAR usando TU componente */}
                <TopBar
                    title="Dashboard"
                    searchPlaceholder="Buscar cupones…"
                    onSearchChange={setQ}
                    primaryButton={{
                        label: "Nuevo Cupón",
                        icon: Plus,
                        onClick: () => navigate("/business-portal/offers/new"),
                    }}
                    rightExtra={
                        <button className="inline-flex items-center justify-center rounded-lg border bg-white px-3 py-2 hover:bg-gray-50">
                            <Bell className="h-4 w-4 text-gray-600" />
                        </button>
                    }
                    avatar={{
                        initials: "R",
                        name: "Restaurant El Buen Sabor",
                        email: "contacto@elbuensabor.com",
                    }}
                />

                <main className="mx-auto max-w-7xl p-4 lg:p-6">
                    <p className="text-gray-500 -mt-1 mb-5">Resumen de tu actividad reciente</p>

                    {/* KPIs */}
                    <SectionTitle title="Resumen" />
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Cupones Activos"
                            subtitle="Disponibles para compra"
                            value={kpis.active}
                            icon={Activity}
                            accent="emerald"
                        />
                        <StatCard
                            title="Total Vendidos"
                            subtitle="Cupones utilizados"
                            value={kpis.soldTotal}
                            icon={CheckCircle2}
                            accent="blue"
                        />
                        <StatCard
                            title="Próximos a vencer"
                            subtitle="Requieren atención"
                            value={kpis.expiring}
                            icon={Clock3}
                            accent="orange"
                        />
                        <StatCard
                            title="Ingresos estimados"
                            subtitle="Monto aproximado"
                            value={`$${kpis.revenue.toLocaleString()}`}
                            icon={BadgeDollarSign}
                            accent="purple"
                        />
                    </div>

                    {/* LISTADO DE CUPONES */}
                    <SectionTitle title="Tus cupones" className="mt-10" />

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={Plus}
                            title="Aún no tienes cupones"
                            description="Crea tu primer cupón y empieza a vender hoy mismo."
                            cta={
                                <button
                                    onClick={() => navigate("/business-portal/offers/new")}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Cupón
                                </button>
                            }
                        />
                    ) : (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="hidden grid-cols-[1fr,140px,140px,120px,120px] gap-4 border-b px-4 py-3 text-sm font-medium text-gray-600 sm:grid">
                                <div>Título</div>
                                <div className="text-center">Estado</div>
                                <div className="text-center">Vendidos</div>
                                <div className="text-center">Vence</div>
                                <div className="text-center">Acciones</div>
                            </div>

                            <ul className="divide-y">
                                {filtered.map((o) => (
                                    <li
                                        key={o.id}
                                        className="grid grid-cols-1 gap-3 px-4 py-3 text-gray-700 sm:grid-cols-[1fr,140px,140px,120px,120px]"
                                    >
                                        <div className="font-medium">{o.title}</div>

                                        <div className="flex items-center justify-start sm:justify-center">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${o.status === "active"
                                                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                                        : o.status === "pending"
                                                            ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                                            : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
                                                    }`}
                                            >
                                                {o.status === "active"
                                                    ? "Activo"
                                                    : o.status === "pending"
                                                        ? "Pendiente"
                                                        : "Expirado"}
                                            </span>
                                        </div>

                                        <div className="text-center font-semibold">{o.sold}</div>
                                        <div className="text-center">{daysLeftText(o.ends_at)}</div>

                                        <div className="flex items-center justify-start gap-2 sm:justify-center">
                                            <Link
                                                to={`/business-portal/offers/${o.id}`}
                                                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                                            >
                                                Ver
                                            </Link>
                                            <Link
                                                to={`/business-portal/offers/${o.id}/edit`}
                                                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                                            >
                                                Editar
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
