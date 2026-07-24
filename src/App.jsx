import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ShopPhysical from './pages/ShopPhysical';
import ShopDigital from './pages/ShopDigital';
import ProductDetail from './pages/ProductDetail';
import PedidoForm from './components/PedidoForm'; // <-- 1. IMPORTA TU FORMULARIO AQUÍ
import AboutUs from './components/AboutUs';
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Todas las páginas dentro de MainLayout compartirán el mismo Navbar y Footer */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="tienda-fisica" element={<ShopPhysical />} />
          <Route path="plantillas-digitales" element={<ShopDigital />} />
          <Route path="producto/:id" element={<ProductDetail />} />
          <Route path="pedido" element={<PedidoForm />} /> {/* <-- 2. AGREGA LA RUTA AQUÍ */}
          <Route path="/sobre-nosotros" element={<AboutUs />} />
        </Route>
      </Routes>
    </Router>
  );
}