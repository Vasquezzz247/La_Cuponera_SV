import { Link } from "react-router-dom"
import "./Footer.css"

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Marca */}
                    <div className="footer-section">
                        <h3 className="footer-logo">La Cuponera SV</h3>
                        <p className="footer-description">
                            La plataforma líder en cupones y ofertas de El Salvador.
                        </p>
                    </div>

                    {/* Enlaces */}
                    <div className="footer-section">
                        <h4 className="footer-title">Enlaces</h4>
                        <div className="footer-links">
                            <Link to="/ofertas">Ofertas</Link>
                            <Link to="/como-funciona">¿Cómo funciona?</Link>
                            <Link to="/contacto">Contacto</Link>
                        </div>
                    </div>

                    {/* Empresas */}
                    <div className="footer-section">
                        <h4 className="footer-title">Empresas</h4>
                        <div className="footer-links">
                            <Link to="/registro-empresa">Registrar empresa</Link>
                            <Link to="/login">Portal empresarial</Link>
                        </div>
                    </div>

                    {/* Legal */}
                    <div className="footer-section">
                        <h4 className="footer-title">Legal</h4>
                        <div className="footer-links">
                            <Link to="/terminos">Términos y condiciones</Link>
                            <Link to="/privacidad">Política de privacidad</Link>
                        </div>
                    </div>
                </div>

                {/* Copy */}
                <div className="footer-bottom">
                    <p>&copy; 2025 La Cuponera SV. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
