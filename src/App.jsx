import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ShopPhysical from './pages/ShopPhysical';
import ShopDigital from './pages/ShopDigital';
import ProductDetail from './pages/ProductDetail';
import PedidoForm from './components/PedidoForm'; // <-- 1. IMPORTA TU FORMULARIO AQUÍ
import AboutUs from './components/AboutUs';
import NotFound from './pages/NotFound';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

export default function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* Todas las páginas dentro de MainLayout compartirán el mismo Navbar y Footer */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="tienda-fisica" element={<ShopPhysical />} />
            <Route path="plantillas-digitales" element={<ShopDigital />} />
            <Route path="producto/:id" element={<ProductDetail />} />
            <Route path="pedido" element={<PedidoForm />} />
            <Route path="hacer-pedido" element={<PedidoForm />} /> {/* Alias de compatibilidad */}
            <Route path="sobre-nosotros" element={<AboutUs />} />
            {/* Ruta comodín 404 personalizada */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <CartDrawer />
      </CartProvider>
    </Router>
  );
}