import React from "react";
import { Link } from "react-router-dom";
import { Users, Star } from "lucide-react";
import logo from "../../assets/logos/CuponeraAlter.png";
import "./Hero.css";

const Hero: React.FC = () => {
    return (
        <section className="hero-section">
            <div className="hero-container">
                <div className="hero-grid">
                    {/* Texto principal */}
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Descubre las mejores
                            <span className="highlight"> ofertas</span> en
                            <span className="highlight"> El Salvador</span>
                        </h1>
                        <p className="hero-subtitle">
                            Ahorra hasta 70% en restaurantes, spas, aventuras y mucho más.
                            Miles de salvadoreños ya disfrutan de nuestras ofertas exclusivas.
                        </p>

                        {/* Botones */}
                        <div className="hero-buttons">
                            <Link to="/register" className="btn btn-primary">
                                Comenzar Ahora
                            </Link>
                            <Link to="/ofertas" className="btn btn-outline">
                                Descubre ofertas
                            </Link>
                        </div>

                        {/* Métricas */}
                        <div className="hero-metrics">
                            <div className="metric">
                                <Users className="metric-icon green" />
                                <span>+10,000 usuarios</span>
                            </div>
                            <div className="metric">
                                <Star className="metric-icon yellow" />
                                <span>4.8/5 estrellas</span>
                            </div>
                        </div>
                    </div>

                    {/* Imagen */}
                    <div className="hero-image">
                        <img
                            src={logo}
                            alt="Logo de La Cuponera"
                            className="image"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;