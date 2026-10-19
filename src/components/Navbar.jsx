import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoTextiprint from '../assets/logo.webp'; 
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { openCart, totalItems } = useCart();

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
        <img src={logoTextiprint} alt="Logo Textiprint" className="nav-logo-img" width="40" height="40" />
        <span className="nav-brand-name">Textiprint</span>
      </Link>

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

      {/* ACCIONES (Carrito + Menú Hamburguesa en móvil) */}
      <div className="nav-actions">
        <button 
          type="button" 
          className="nav-cart-btn" 
          onClick={openCart} 
          aria-label={`Ver carrito (${totalItems})`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {totalItems > 0 && (
            <span className="nav-cart-badge">{totalItems}</span>
          )}
        </button>

        {/* BOTÓN HAMBURGUESA (Solo se mostrará en pantallas pequeñas) */}
        <button className="menu-toggle-btn" onClick={toggleMenu} aria-label="Abrir menú">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}