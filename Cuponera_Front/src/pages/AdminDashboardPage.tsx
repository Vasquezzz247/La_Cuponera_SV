import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck,
    Clock3,
    Building2,
    Users,
    Tag,
    Bell,
    CheckCircle2,
    Search,
    Plus,
} from "lucide-react";

import Sidebar from "@/components/portal/Sidebar";
import TopBar from "@/components/portal/TopBar";
import StatCard from "@/components/portal/StatCard";
import SectionTitle from "@/components/portal/SectionTitle";
import EmptyState from "@/components/portal/EmptyState";

// ========================= MOCK TEMPORAL =========================
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

// ========================= FUNCIONES AUXILIARES =========================
export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const [q, setQ] = useState("");

    // Filtrado simple
    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        return MOCK_ENTITIES.filter(
            (e) =>
                !term ||
                e.name.toLowerCase().includes(term) ||
                e.type.includes(term) ||
                e.status.includes(term),
        );
    }, [q]);

    // KPIs para las cards superiores
    const kpis = useMemo(() => {
        const offers = MOCK_ENTITIES.filter((e) => e.type === "offer");
        const activeOffers = offers.filter((e) => e.status === "approved").length;
        const pending = offers.filter((e) => e.status === "pending").length;
        const verified = MOCK_ENTITIES.filter(
            (e) => e.type === "business" && e.status === "approved",
        ).length;
        const users = MOCK_ENTITIES.filter((e) => e.type === "user").length;
        return { activeOffers, pending, verified, users };
    }, []);

    // ========================= LAYOUT =========================
    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* SIDEBAR */}
            <Sidebar
                brand={{
                    icon: ShieldCheck,
                    title: "Admin Panel",
                    subtitle: "La Cuponera SV",
                    iconBgClass: "from-emerald-600 to-emerald-700",
                }}
                items={[
                    { id: "dashboard", label: "Dashboard", icon: CheckCircle2 },
                    { id: "moderation", label: "Moderación de Ofertas", icon: ShieldCheck },
                    { id: "business", label: "Empresas", icon: Building2 },
                    { id: "users", label: "Usuarios", icon: Users },
                    { id: "categories", label: "Categorías", icon: Tag },
                    { id: "settings", label: "Ajustes", icon: Bell },
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

            {/* CONTENIDO PRINCIPAL */}
            <div className="lg:pl-64">
                {/* TOPBAR */}
                <TopBar
                    title="Dashboard"
                    searchPlaceholder="Búsqueda global..."
                    onSearchChange={setQ}
                    primaryButton={{
                        label: "Nuevo Cupón",
                        icon: Plus,
                        onClick: () => navigate("/admin/offers/new"),
                    }}
                    rightExtra={
                        <button className="inline-flex items-center justify-center rounded-lg border bg-white px-3 py-2 hover:bg-gray-50">
                            <Bell className="h-4 w-4 text-gray-600" />
                        </button>
                    }
                    avatar={{
                        initials: "A",
                        name: "Admin Master",
                        email: "admin@lacuponera.sv",
                        bgClass: "bg-emerald-700",
                    }}
                />

                {/* MAIN */}
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

                    {/* TABLA DE ENTIDADES */}
                    <SectionTitle title="Registros recientes" className="mt-10" />

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={Search}
                            title="Sin resultados"
                            description="No se encontraron registros que coincidan con tu búsqueda."
                        />
                    ) : (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="hidden grid-cols-[1fr,140px,160px,120px] gap-4 border-b px-4 py-3 text-sm font-medium text-gray-600 sm:grid">
                                <div>Nombre</div>
                                <div className="text-center">Tipo</div>
                                <div className="text-center">Estado</div>
                                <div className="text-center">Acciones</div>
                            </div>

                            <ul className="divide-y">
                                {filtered.map((e) => (
                                    <li
                                        key={e.id}
                                        className="grid grid-cols-1 gap-3 px-4 py-3 text-gray-700 sm:grid-cols-[1fr,140px,160px,120px]"
                                    >
                                        <div className="font-medium truncate">{e.name}</div>

                                        <div className="text-center capitalize">{e.type}</div>

                                        <div className="flex items-center justify-start sm:justify-center">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.status === "approved"
                                                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                                        : e.status === "pending"
                                                            ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                                            : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
                                                    }`}
                                            >
                                                {e.status === "approved"
                                                    ? "Aprobado"
                                                    : e.status === "pending"
                                                        ? "Pendiente"
                                                        : "Deshabilitado"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-start gap-2 sm:justify-center">
                                            <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
                                                Ver
                                            </button>
                                            <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
                                                Editar
                                            </button>
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