import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand-col">
          <h3 className="footer-brand-title">Textiprint</h3>
          <p style={{ color: '#aaa', lineHeight: '1.5' }}>
            Diseño creativo, papelería personalizada y recursos digitales listos para potenciar tus ideas.
          </p>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-title">Navegación</h4>
          <ul className="footer-list">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/tienda-fisica">Papelería Física</Link></li>
            <li><Link to="/plantillas-digitales">Plantillas Canva</Link></li>
            {/* NUEVO ENLACE A SOBRE NOSOTROS */}
            <li><Link to="/sobre-nosotros">Sobre Nosotros</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-title">Atención Local</h4>
          <ul className="footer-list" style={{ color: '#aaa' }}>
            <li>📍 Los Teques, Edo. Miranda</li>
            <li>🕒 Entregas coordinadas</li>
            <li>💳 Pago Móvil, Zinli, Binance, PayPal</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Textiprint. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}