"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tag, Menu, X, User, Building2, LogOut, ChevronDown } from "lucide-react";
import { apiFetch } from "@/lib/http";
import "./Navbar.css";

function parseJwt(token: string): any | null {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

function extractRolesFromPayload(payload: any): Set<string> {
    const set = new Set<string>();

    const rolesAny = payload?.roles;
    if (Array.isArray(rolesAny)) {
        for (const r of rolesAny) {
            if (typeof r === "string") set.add(r.toLowerCase());
            else if (r && typeof r.name === "string") set.add(r.name.toLowerCase());
        }
    }

    const addFrom = (val: any) => {
        if (!val) return;
        if (typeof val === "string") {
            val.split(/[,\s]+/).filter(Boolean).forEach((v) => set.add(v.toLowerCase()));
        } else if (Array.isArray(val)) {
            val.forEach((v) => set.add(String(v).toLowerCase()));
        }
    };
    addFrom(payload?.role);
    addFrom(payload?.scope);
    addFrom(payload?.scopes);

    return set;
}

export function Navbar() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [logoutMsg, setLogoutMsg] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // ======== Sesión & roles =========
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    // mostramos logueado si hay token (sin flicker)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!token);
    const [hasUser, setHasUser] = useState<boolean>(!!token);

    // arrancamos "hasBusiness" desde:
    // 1) roles del JWT si existen; 2) cache local si no; default false
    const initialBusiness = (() => {
        if (!token) return false;
        const roles = extractRolesFromPayload(parseJwt(token) ?? {});
        if (roles.size > 0) return roles.has("business");
        const cached = localStorage.getItem("auth_has_business");
        return cached === "1" || cached === "true";
    })();
    const [hasBusiness, setHasBusiness] = useState<boolean>(initialBusiness);

    // Al montar: si el token NO trajo roles, consultamos /me para confirmar y cacheamos.
    useEffect(() => {
        const t = localStorage.getItem("auth_token");
        if (!t) {
            setIsLoggedIn(false);
            setHasUser(false);
            setHasBusiness(false);
            localStorage.removeItem("auth_has_business");
            return;
        }

        const rolesFromToken = extractRolesFromPayload(parseJwt(t) ?? {});
        if (rolesFromToken.size > 0) {
            const hb = rolesFromToken.has("business");
            setIsLoggedIn(true);
            setHasUser(true);
            setHasBusiness(hb);
            localStorage.setItem("auth_has_business", hb ? "1" : "0");
            return;
        }

        // 🔎 Tu endpoint real para perfil con roles:
        (async () => {
            try {
                const me: any = await apiFetch("/me", { method: "GET", auth: true });
                const names = Array.isArray(me?.roles)
                    ? me.roles.map((r: any) =>
                        typeof r === "string" ? r.toLowerCase() : String(r?.name ?? "").toLowerCase()
                    )
                    : [];
                const hb = names.includes("business");
                setIsLoggedIn(true);
                setHasUser(true);
                setHasBusiness(hb);
                localStorage.setItem("auth_has_business", hb ? "1" : "0");
            } catch {
                // si /me falla, mantenemos lo actual (UI sigue funcionando)
            }
        })();
    }, []); // solo una vez

    // ======== Logout =========
    async function handleLogout() {
        try {
            await apiFetch("/auth/logout", { method: "POST", auth: true });
        } catch {
            // ignoramos error del server
        } finally {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_has_business");
            setMenuOpen(false);
            setIsLoggedIn(false);
            setHasUser(false);
            setHasBusiness(false);
            setLogoutMsg("Sesión cerrada exitosamente ✅");
            navigate("/", { replace: true });
            window.setTimeout(() => setLogoutMsg(null), 3000);
        }
    }

    // Cerrar dropdown al click fuera
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    // Cerrar dropdown al resize
    useEffect(() => {
        const onResize = () => setMenuOpen(false);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return (
        <nav className="nav">
            <div className="nav-container">
                <div className="nav-content">
                    {/* Logo */}
                    <Link to="/" className="nav-logo">
                        <Tag className="nav-logo-icon" />
                        <span className="nav-logo-text">La Cuponera SV</span>
                    </Link>

                    {/* Desktop Navbar */}
                    <div className="nav-links">
                        <Link to="/ofertas" className="nav-link">Ofertas</Link>
                        <div className="nav-buttons">
                            {/* Botón verde por rol */}
                            {hasBusiness ? (
                                <Link to="/business-portal" className="btn btn-primary">
                                    <Building2 className="btn-icon" />
                                    Portal de Empresa
                                </Link>
                            ) : (
                                <Link to="/register-company" className="btn btn-primary">
                                    <Building2 className="btn-icon" />
                                    Registrar Empresa
                                </Link>
                            )}

                            {/* A la derecha: Perfil si logeado; si no, Iniciar Sesión */}
                            {isLoggedIn && hasUser ? (
                                <div className="profile-wrapper" ref={menuRef}>
                                    <button className="btn profile-btn" onClick={() => setMenuOpen((v) => !v)}>
                                        <User className="btn-icon" />
                                        <span className="profile-label">Perfil</span>
                                        <ChevronDown className="chev-icon" />
                                    </button>

                                    {menuOpen && (
                                        <div className="profile-menu">
                                            <Link to="/profile" className="profile-item" onClick={() => setMenuOpen(false)}>
                                                <User className="profile-item-icon" />
                                                Ver perfil
                                            </Link>
                                            <button className="profile-item danger" onClick={handleLogout}>
                                                <LogOut className="profile-item-icon" />
                                                Cerrar sesión
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="btn btn-ghost">
                                    <User className="btn-icon" />
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="nav-mobile-toggle">
                        <button
                            className="btn btn-ghost"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navbar */}
                {isMobileMenuOpen && (
                    <div className="nav-mobile-menu">
                        <Link to="/" className="nav-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
                        <Link to="/ofertas" className="nav-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Ofertas</Link>
                        <Link to="/como-funciona" className="nav-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>¿Cómo funciona?</Link>

                        <div className="nav-mobile-buttons">
                            {hasBusiness ? (
                                <Link to="/business-portal" className="btn btn-primary w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Building2 className="btn-icon" />
                                    Portal de Empresa
                                </Link>
                            ) : (
                                <Link to="/register-company" className="btn btn-primary w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Building2 className="btn-icon" />
                                    Registrar Empresa
                                </Link>
                            )}

                            {isLoggedIn && hasUser ? (
                                <>
                                    <Link to="/profile" className="btn btn-ghost w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                        <User className="btn-icon" />
                                        Ver perfil
                                    </Link>
                                    <button className="btn btn-ghost w-full" onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}>
                                        <LogOut className="btn-icon" />
                                        Cerrar sesión
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="btn btn-ghost w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                    <User className="btn-icon" />
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Toast de logout */}
            {logoutMsg && <div className="nav-toast">{logoutMsg}</div>}
        </nav>
    );
}

export default Navbar;