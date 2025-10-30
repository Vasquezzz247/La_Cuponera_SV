// src/pages/business/BusinessPortalPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import OffersService, { type Offer, type OfferCreateJson as OfferCreate } from "@/services/offers";
import BusinessOffersList from "@/components/portal/BusinessOffersList";
import {
    Activity,
    CheckCircle2,
    Clock3,
    BadgeDollarSign,
    Plus,
    LogOut,
    Home,
    ChevronDown,
    X,
    Info,
} from "lucide-react";

import Sidebar from "@/components/portal/Sidebar";
import TopBar from "@/components/portal/TopBar";
import StatCard from "@/components/portal/StatCard";
import SectionTitle from "@/components/portal/SectionTitle";
import EmptyState from "@/components/portal/EmptyState";
import AccountService, { type MeResponse, getDisplayName } from "@/services/account";

/* ---------------------------------- utils --------------------------------- */
function isExpired(iso: string) {
    const end = new Date(iso);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return end.getTime() < now.getTime();
}

type MyOffer = Offer & { coupons_count?: number };
type MaybePaginated<T> = T[] | { data?: T[];[k: string]: any };

function normalizeArray<T>(res: MaybePaginated<T> | null | undefined): T[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray((res as any).data)) return (res as any).data as T[];
    return [];
}

/** force YYYY-MM-DD regardless of locale input like mm/dd/yyyy */
function toISODate(value: string): string {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const slash = value.split("/");
    if (slash.length === 3) {
        const [m, d, y] = slash;
        const mm = `${m}`.padStart(2, "0");
        const dd = `${d}`.padStart(2, "0");
        return `${y}-${mm}-${dd}`;
    }
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    const mm = `${dt.getMonth() + 1}`.padStart(2, "0");
    const dd = `${dt.getDate()}`.padStart(2, "0");
    return `${dt.getFullYear()}-${mm}-${dd}`;
}

/* -------------------------------- user menu ------------------------------- */
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

    const initials = (name || "E").slice(0, 1).toUpperCase();

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 rounded-lg border bg-white px-2.5 py-2 hover:bg-gray-50 sm:px-3"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
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

/* ----------------------------- modal: new offer ---------------------------- */
function NewOfferModal({
    open,
    onClose,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: OfferCreate) => Promise<void>;
}) {
    const [title, setTitle] = useState("");
    const [regularPrice, setRegularPrice] = useState<number | string>("");
    const [offerPrice, setOfferPrice] = useState<number | string>("");
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");
    const [redeemBy, setRedeemBy] = useState("");
    const [quantity, setQuantity] = useState<number | string>("");
    const [description, setDescription] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!open) return null;

    const discount =
        regularPrice && offerPrice
            ? Math.round(
                ((Number(regularPrice) - Number(offerPrice)) / Number(regularPrice)) * 100
            )
            : 0;

    function validate(): string | null {
        const s = toISODate(startsAt);
        const e = toISODate(endsAt);
        const r = toISODate(redeemBy);
        if (!s || !e || !r) return "Completa todas las fechas.";
        const sd = new Date(s).getTime();
        const ed = new Date(e).getTime();
        const rd = new Date(r).getTime();
        if (Number.isNaN(sd) || Number.isNaN(ed) || Number.isNaN(rd))
            return "Las fechas no son válidas.";
        if (ed < sd) return "La fecha de fin debe ser mayor o igual a la fecha de inicio.";
        if (rd < ed) return "‘Canjeable hasta’ debe ser mayor o igual a la fecha de fin.";
        if (!title.trim()) return "Ingresa un título.";
        if (!(Number(regularPrice) > 0) || !(Number(offerPrice) > 0))
            return "Precios inválidos.";
        if (Number(offerPrice) > Number(regularPrice))
            return "El precio de oferta no puede ser mayor que el precio normal.";
        if (!(Number(quantity) >= 1)) return "Cantidad mínima: 1.";
        if (!description.trim()) return "Agrega una descripción.";
        return null;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const error = validate();
        if (error) {
            setFormError(error);
            return;
        }
        setFormError(null);
        setLoading(true);
        try {
            const payload: OfferCreate = {
                title,
                regular_price: Number(regularPrice),
                offer_price: Number(offerPrice),
                starts_at: toISODate(startsAt),
                ends_at: toISODate(endsAt),
                redeem_by: toISODate(redeemBy),
                quantity: Number(quantity),
                description,
                status: "available",
            };
            await onSubmit(payload);
            onClose();
            setTitle("");
            setRegularPrice("");
            setOfferPrice("");
            setStartsAt("");
            setEndsAt("");
            setRedeemBy("");
            setQuantity("");
            setDescription("");
            setImagePreview(null);
        } catch (err) {
            console.error(err);
            alert("Error guardando el cupón");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-[min(680px,92vw)] rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-t-2xl border-b bg-white/90 px-5 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Nuevo Cupón</h2>
                    <button
                        aria-label="Cerrar"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 pb-5 pt-2">
                    {formError && (
                        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-800">
                            <Info className="mt-0.5 h-4 w-4" />
                            <p className="text-sm">{formError}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Título
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-0 transition focus:border-emerald-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Precio normal ($)
                                </label>
                                <input
                                    type="number"
                                    value={regularPrice}
                                    onChange={(e) => setRegularPrice(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Precio oferta ($)
                                </label>
                                <input
                                    type="number"
                                    value={offerPrice}
                                    onChange={(e) => setOfferPrice(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-emerald-500"
                                />
                                {discount > 0 && (
                                    <p className="mt-1 text-xs font-semibold text-emerald-600">
                                        Descuento automático: {discount}%
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Inicio
                                </label>
                                <input
                                    type="date"
                                    value={startsAt}
                                    onChange={(e) => setStartsAt(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Fin
                                </label>
                                <input
                                    type="date"
                                    value={endsAt}
                                    onChange={(e) => setEndsAt(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Canjeable hasta
                                </label>
                                <input
                                    type="date"
                                    value={redeemBy}
                                    onChange={(e) => setRedeemBy(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Cantidad
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Imagen (opcional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        setImagePreview(file ? URL.createObjectURL(file) : null);
                                    }}
                                    className="w-full text-sm"
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="preview"
                                        className="mt-2 h-24 w-full rounded-lg border object-cover"
                                    />
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    (La carga real de imagen se conectará a la API más adelante)
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Descripción
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-emerald-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {loading ? "Guardando..." : "Guardar Cupón"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ---------------------------------- page ---------------------------------- */
export default function BusinessPortalPage() {
    const navigate = useNavigate();

    const [q, setQ] = useState("");
    const [me, setMe] = useState<MeResponse | null>(null);
    const [loadingMe, setLoadingMe] = useState(true);

    const [offers, setOffers] = useState<MyOffer[]>([]);
    const [loadingOffers, setLoadingOffers] = useState(true);
    const [errorOffers, setErrorOffers] = useState<string | null>(null);

    const [newModalOpen, setNewModalOpen] = useState(false);

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

    useEffect(() => {
        (async () => {
            try {
                setLoadingOffers(true);
                const raw = (await OffersService.mine()) as MaybePaginated<MyOffer>;
                setOffers(normalizeArray(raw));
            } catch (e: any) {
                setErrorOffers(e?.message ?? "Error cargando tus ofertas");
            } finally {
                setLoadingOffers(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        return offers.filter(
            (o) =>
                !t || o.title.toLowerCase().includes(t) || String(o.status).toLowerCase().includes(t)
        );
    }, [q, offers]);

    const kpis = useMemo(() => {
        const list = offers;
        const active = list.filter((o) => o.status === "available" && !isExpired(o.ends_at)).length;
        const soldTotal = list.reduce((acc, o) => acc + (o.coupons_count ?? 0), 0);
        const expiring = list
            .filter((o) => o.status === "available" && !isExpired(o.ends_at))
            .filter((o) => {
                const d = new Date(o.ends_at);
                const now = new Date();
                d.setHours(0, 0, 0, 0);
                now.setHours(0, 0, 0, 0);
                return Math.ceil((d.getTime() - now.getTime()) / 86400000) <= 3;
            }).length;
        const revenue = list.reduce(
            (acc, o) => acc + (o.offer_price ?? 0) * (o.coupons_count ?? 0),
            0
        );
        return { active, soldTotal, expiring, revenue };
    }, [offers]);

    const displayName = loadingMe ? "Cargando…" : getDisplayName(me);

    async function handleLogout() {
        localStorage.removeItem("auth_token");
        navigate("/", { replace: true });
    }

    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Sidebar (desktop) */}
            <div className="hidden lg:block">
                <Sidebar
                    brand={{
                        icon: Activity,
                        title: "Portal Empresas",
                        subtitle: "La Cuponera SV",
                        iconBgClass: "from-emerald-500 to-emerald-600",
                    }}
                    items={[
                        { id: "dashboard", label: "Dashboard", icon: Activity },
                        { id: "new", label: "Nuevo Cupón", icon: Plus },
                    ]}
                    activeId="dashboard"
                    onSelect={(id) => {
                        if (id === "new") setNewModalOpen(true);
                    }}
                />
            </div>

            {/* Content */}
            <div className="lg:pl-64">
                <TopBar
                    title="Dashboard"
                    searchPlaceholder="Buscar cupones…"
                    onSearchChange={setQ}
                    primaryButton={{
                        label: "Nuevo Cupón",
                        icon: Plus,
                        onClick: () => setNewModalOpen(true),
                    }}
                    rightExtra={
                        <UserMenu
                            name={displayName || "Mi empresa"}
                            email={me?.email}
                            onLogout={handleLogout}
                            onExit={() => navigate("/", { replace: true })}
                        />
                    }
                />

                <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:p-6">
                    <p className="mb-5 -mt-1 text-gray-500">Resumen de tu actividad reciente</p>

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

                    {/* Listado */}
                    <SectionTitle title="Tus cupones" className="mt-10" />
                    {loadingOffers ? (
                        <div className="mt-3 rounded-2xl border bg-white p-6 text-gray-500">
                            Cargando tus cupones…
                        </div>
                    ) : errorOffers ? (
                        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                            {errorOffers}
                        </div>
                    ) : filtered.length === 0 ? (
                        <EmptyState
                            icon={Plus}
                            title="Aún no tienes cupones"
                            description="Crea tu primer cupón y empieza a vender hoy mismo."
                            cta={
                                <button
                                    onClick={() => setNewModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Cupón
                                </button>
                            }
                        />
                    ) : (
                        <BusinessOffersList
                            offers={filtered}
                            onDelete={async (id: number | string) => {
                                const ok = window.confirm(
                                    "¿Seguro que deseas eliminar este cupón? Esta acción no se puede deshacer."
                                );
                                if (!ok) return;

                                try {
                                    await OffersService.remove(id);
                                    setOffers((prev) => prev.filter((o) => String(o.id) !== String(id)));
                                } catch (e: any) {
                                    console.error(e);
                                    alert(e?.message ?? "No se pudo eliminar el cupón.");
                                }
                            }}
                        />
                    )}
                </main>
            </div>

            {/* Modal crear cupón */}
            <NewOfferModal
                open={newModalOpen}
                onClose={() => setNewModalOpen(false)}
                onSubmit={async (payload) => {
                    await OffersService.create(payload);
                    const updated = await OffersService.mine();
                    setOffers(normalizeArray(updated as MaybePaginated<MyOffer>));
                }}
            />
        </div>
    );
}
