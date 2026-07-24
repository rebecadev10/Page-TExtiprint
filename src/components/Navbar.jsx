import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoTextiprint from '../assets/logo.png'; 

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo-link">
        <img src={logoTextiprint} alt="Logo Textiprint" className="nav-logo-img" />
        {/* Borra este span si tu logo ya incluye el nombre de la marca */}
        <span className="nav-brand-name">Textiprint</span>
      </Link>
      
      <div className="nav-links">
        <Link to="/" className={`nav-link-item ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
        <Link to="/tienda-fisica" className={`nav-link-item ${location.pathname === '/tienda-fisica' ? 'active' : ''}`}>Papelería</Link>
        <Link to="/plantillas-digitales" className={`nav-link-item ${location.pathname === '/plantillas-digitales' ? 'active' : ''}`}>Plantillas Canva</Link>
      </div>

      <a href="https://wa.me/584142467351" target="_blank" rel="noreferrer" className="btn-nav-contact">
        Contáctenos
      </a>
    </nav>
  );
}