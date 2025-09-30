// src/pages/ProfilePage.tsx
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/http";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Building2 } from "lucide-react";
import OfferCard from "@/components/OfferCard/OfferCard";

type CardOffer = {
  id: number;
  title: string;
  company: string;
  image: string;
  discount: number;        // %
  category: string;
  discountPrice: number;   // offer_price
  originalPrice: number;   // regular_price
  rating: number;
  reviews: number;
  location: string;
  timeLeft: string;
};

type APICoupon = {
  id: number | string;
  offer_id?: number | string;
  offer?: any;
  offer_data?: any;
  [k: string]: any;
};

type APIUser = {
  id: number;
  name: string;
  last_name?: string;
  email: string;
  roles: { id: number; name: string }[];
};

const ENDPOINT_COUPONS = "/my/coupons";
const ENDPOINT_ME = "/me";

function percentOff(regular?: number, offer?: number) {
  const r = Number(regular);
  const o = Number(offer);
  if (!r || !o || r <= 0) return 0;
  const pct = Math.round((1 - o / r) * 100);
  return Math.max(0, Math.min(100, pct));
}

function daysLeftText(ends_at?: string) {
  if (!ends_at) return "";
  const end = new Date(ends_at);
  const now = new Date();
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Expirada";
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "1 día";
  return `${diffDays} días`;
}

// Normaliza lo que venga de /my/coupons a lo que necesita OfferCard
function couponToCardOffer(c: APICoupon): CardOffer | null {
  const o =
    c.offer ??
    c.offer_data ??
    (("title" in c || "regular_price" in c) ? c : null);

  if (!o) return null;

  const id = Number(o.id ?? c.offer_id ?? c.id ?? 0);
  const title = String(o.title ?? "Cupón");
  const regular = Number(o.regular_price ?? 0);
  const offerPrice = Number(o.offer_price ?? 0);
  const company =
    o.business_name ??
    o.business?.name ??
    o.company ??
    "Empresa";
  const image = o.image_url ?? o.image ?? "";
  const category = o.category ?? "General";
  const rating = Number(o.rating ?? 0);
  const reviews = Number(o.reviews ?? 0);
  const location = o.location ?? "—";
  const timeLeft = daysLeftText(o.ends_at ?? o.redeem_by ?? o.expires_at);

  return {
    id,
    title,
    company,
    image,
    discount: percentOff(regular, offerPrice),
    category,
    discountPrice: offerPrice || 0,
    originalPrice: regular || 0,
    rating,
    reviews,
    location,
    timeLeft,
  };
}

// Clases de columnas estáticas (necesario para Tailwind)
function gridColsClass(cols: 3 | 4) {
  return cols === 3
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<CardOffer[]>([]);
  const [cols] = useState<3 | 4>(4);

  // usuario
  const [user, setUser] = useState<APIUser | null>(null);
  const hasBusiness = user?.roles?.some((r) => r.name.toLowerCase() === "business");
  const fullName = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();

  // fetch paralelo de /me y /my/coupons
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [me, couponsRes] = await Promise.all([
          apiFetch<APIUser>(ENDPOINT_ME, { method: "GET", auth: true }),
          apiFetch<APICoupon[] | { data: APICoupon[] }>(ENDPOINT_COUPONS, {
            method: "GET",
            auth: true,
          }),
        ]);

        if (mounted) setUser(me);

        const raw = Array.isArray(couponsRes) ? couponsRes : (couponsRes as any)?.data ?? [];
        const mapped = raw.map(couponToCardOffer).filter(Boolean) as CardOffer[];
        if (mounted) setCoupons(mapped);
      } catch {
        if (mounted) {
          setUser(null);
          setCoupons([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // stats simples
  const stats = useMemo(() => {
    const total = coupons.length;
    const expirados = coupons.filter((c) => c.timeLeft === "Expirada").length;
    const activos = total - expirados;
    return { total, usados: 0, activos, expirados };
  }, [coupons]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-2xl translate-y-32 -translate-x-32" />

        <div className="relative px-4 py-16 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-8">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="relative group">
                  <div className="h-32 w-32 md:h-36 md:w-36 rounded-3xl ring-4 ring-white/30 bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl flex items-center justify-center transition-transform group-hover:scale-105">
                    <UserIcon className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-400 rounded-full ring-4 ring-white flex items-center justify-center">
                    <div className="h-3 w-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              {/* Info usuario + stats */}
              <div className="flex-1 text-white">
                <div className="mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                    {fullName || "Mi Perfil"}
                  </h1>
                  <p className="mt-2 text-emerald-100/90 text-lg font-medium">
                    Tus cupones adquiridos en La Cuponera SV
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 text-sm font-semibold">
                    <span>{stats.total} Cupones</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-500/30 backdrop-blur-sm border border-green-400/50 px-4 py-2 text-sm font-semibold">
                    <span>{stats.activos} Activos</span>
                  </div>
                  {stats.expirados > 0 && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-red-500/30 backdrop-blur-sm border border-red-400/50 px-4 py-2 text-sm font-semibold">
                      <span>{stats.expirados} Expirados</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-200 shadow-lg">
                  <Link to="/">Explorar ofertas</Link>
                </Button>

                {hasBusiness ? (
                  <Button asChild className="bg-emerald-500/80 backdrop-blur-sm hover:bg-emerald-600/90 hover:scale-105 transition-all duration-200 shadow-lg border border-emerald-400/50 text-white">
                    <Link to="/business-portal">
                      <Building2 className="mr-2 h-4 w-4" />
                      Portal de empresas
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="bg-emerald-500/80 backdrop-blur-sm hover:bg-emerald-600/90 hover:scale-105 transition-all duration-200 shadow-lg border border-emerald-400/50 text-white">
                    <Link to="/register-company">
                      <Building2 className="mr-2 h-4 w-4" />
                      Registrar empresa
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de cupones */}
      <div className="mx-auto max-w-7xl px-4 -mt-8 relative z-10 pb-24">
        <div className={`grid gap-6 ${gridColsClass(cols)}`}>
          {loading ? (
            Array.from({ length: cols * 2 }).map((_, i) => (
              <div key={i} className="w-full max-w-[360px] mx-auto">
                <div className="rounded-2xl bg-white shadow-md animate-pulse border border-gray-100 w-full" style={{ height: 460 }}>
                  <div className="h-48 bg-gray-200 rounded-t-2xl" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              </div>
            ))
          ) : coupons.length > 0 ? (
            coupons.map((offer) => (
              <div key={offer.id} className="w-full max-w-[360px] mx-auto">
                <OfferCard offer={offer} style={{ width: "100%" }} />
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl shadow-xl p-12 text-center border border-emerald-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  ¡Aún no tienes cupones!
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Descubre increíbles ofertas y descuentos en tus lugares favoritos
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-8 py-3 rounded-lg text-white font-semibold">
                    <Link to="/ofertas">Comprar Cupones</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-3 rounded-lg font-semibold">
                    <Link to="/">Explorar Ofertas</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}