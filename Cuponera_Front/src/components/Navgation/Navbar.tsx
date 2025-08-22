"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Tag, Menu, X, User, Building2 } from "lucide-react";
import "./Navbar.css";

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                        <Link to="/" className="nav-link">
                            Inicio
                        </Link>
                        <Link to="/ofertas" className="nav-link">
                            Ofertas
                        </Link>
                        <Link to="/como-funciona" className="nav-link">
                            ¿Cómo funciona?
                        </Link>
                        <div className="nav-buttons">
                            <Link to="/login" className="btn btn-ghost">
                                <User className="btn-icon" />
                                Iniciar Sesión
                            </Link>
                            <Link to="/registro-empresa" className="btn btn-primary">
                                <Building2 className="btn-icon" />
                                Registrar Empresa
                            </Link>
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
                        <Link to="/" className="nav-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Inicio
                        </Link>
                        <Link
                            to="/ofertas"
                            className="nav-mobile-link"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Ofertas
                        </Link>
                        <Link
                            to="/como-funciona"
                            className="nav-mobile-link"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            ¿Cómo funciona?
                        </Link>
                        <div className="nav-mobile-buttons">
                            <Link to="/login" className="btn btn-ghost w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                <User className="btn-icon" />
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/registro-empresa"
                                className="btn btn-primary w-full"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Building2 className="btn-icon" />
                                Registrar Empresa
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;