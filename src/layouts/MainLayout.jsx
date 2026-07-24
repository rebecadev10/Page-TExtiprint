import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      backgroundColor: '#fffafb' // Tu color blanco de fondo principal
    }}>
      {/* Navbar fijo en la parte superior */}
      <Navbar />

      {/* El Outlet es el contenedor donde React Router renderizará dinámicamente Home, Shop, etc. */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer fijo en la parte inferior */}
      <Footer />
    </div>
  );
}