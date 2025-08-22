import { Link } from "react-router-dom"
import "./CTASection.css"

export default function CTASection() {
    return (
        <section className="cta-section">
            <div className="cta-container">
                <h2 className="cta-title">¿Tienes un negocio?</h2>
                <p className="cta-subtitle">
                    Únete a cientos de empresas que ya promocionan sus ofertas en La Cuponera SV y aumenta tus ventas hasta un
                    300%.
                </p>
                <Link to="/registro-empresa" className="cta-button">
                    Registrar mi empresa
                </Link>
            </div>
        </section>
    )
}
