import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, CheckCircle2, Users as UsersIcon, Home, LogOut, ChevronDown } from "lucide-react";

import Sidebar from "@/components/portal/Sidebar";
import TopBar from "@/components/portal/TopBar";
import UsersTable from "@/components/admin/UsersTable";
import AccountService, { type MeResponse, getDisplayName } from "@/services/account";

/* Menú de usuario (igual estilo que en Dashboard) */
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
    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 rounded-lg border bg-white px-2.5 py-2 hover:bg-gray-50 sm:px-3"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white">
                    {(name || "A").slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden text-left sm:block">
                    <div className="text-sm font-medium text-gray-900">{name}</div>
                    {email ? <div className="text-xs text-gray-500">{email}</div> : null}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
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

export default function AdminUsersPage() {
    const navigate = useNavigate();
    const [me, setMe] = useState<MeResponse | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await AccountService.me();
                setMe(data);
            } catch { }
        })();
    }, []);

    const displayName = getDisplayName(me);

    async function handleLogout() {
        localStorage.removeItem("auth_token");
        navigate("/", { replace: true });
    }

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
                    { id: "users", label: "Usuarios", icon: UsersIcon },
                ]}
                activeId="users"
                onSelect={(id) => {
                    const routes: Record<string, string> = {
                        dashboard: "/admin-portal",
                        users: "/admin/users",
                    };
                    navigate(routes[id] ?? "/admin");
                }}
            />

            {/* Content */}
            <div className="lg:pl-64">
                <TopBar
                    title="Usuarios"
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
                    <p className="text-gray-500 -mt-1 mb-4">Listado de cuentas en la plataforma.</p>
                    <UsersTable />
                </main>
            </div>
        </div>
    );
}
