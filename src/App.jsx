import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';

// Code Splitting (Carga perezosa de rutas secundarias para maximizar velocidad inicial de carga)
const ShopPhysical = lazy(() => import('./pages/ShopPhysical'));
const ShopDigital = lazy(() => import('./pages/ShopDigital'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const PedidoForm = lazy(() => import('./components/PedidoForm'));
const AboutUs = lazy(() => import('./components/AboutUs'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>}>
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
        </Suspense>
        <CartDrawer />
      </CartProvider>
    </Router>
  );
}