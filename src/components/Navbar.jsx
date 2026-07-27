import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoTextiprint from '../assets/logo.png'; 

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* LOGO E IDENTIDAD */}
      <Link to="/" className="nav-logo-link" onClick={closeMenu}>
        <img src={logoTextiprint} alt="Logo Textiprint" className="nav-logo-img" />
        <span className="nav-brand-name">Textiprint</span>
      </Link>

      {/* BOTÓN HAMBURGUESA (Solo se mostrará en pantallas pequeñas) */}
      <button className="menu-toggle-btn" onClick={toggleMenu} aria-label="Abrir menú">
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* MENÚ DE ENLACES (Se despliega en móvil) */}
      <div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
        <Link 
          to="/" 
          className={`nav-link-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={closeMenu}
        >
          Inicio
        </Link>
        <Link 
          to="/tienda-fisica" 
          className={`nav-link-item ${location.pathname === '/tienda-fisica' ? 'active' : ''}`}
          onClick={closeMenu}
        >
          Papelería
        </Link>
        <Link 
          to="/plantillas-digitales" 
          className={`nav-link-item ${location.pathname === '/plantillas-digitales' ? 'active' : ''}`}
          onClick={closeMenu}
        >
          Plantillas Canva
        </Link>
        
        {/* En móvil el botón de contacto baja dentro del menú desplegable */}
        <a 
          href="https://wa.me/584142467351" 
          target="_blank" 
          rel="noreferrer" 
          className="btn-nav-contact"
          onClick={closeMenu}
        >
          Contáctenos
        </a>
      </div>
    </nav>
  );
}