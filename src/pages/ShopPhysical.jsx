import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const CACHE_KEY_PHYSICAL = 'textiprint_cached_physical';
const CACHE_KEY_TASA = 'textiprint_cached_tasa';

export default function ShopPhysical() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_PHYSICAL);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [tasa, setTasa] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_TASA);
      return cached ? parseFloat(cached) : 1;
    } catch {
      return 1;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_PHYSICAL);
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    async function obtenerProductosYTasa() {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de red')), 10000)
        );

        const fetchPromise = Promise.all([
          supabase
            .from('productos')
            .select('id, nombre, tipo, imagen_url, product_variations(precio_venta)')
            .eq('tipo', 'fisico')
            .order('nombre'),
          supabase
            .from('configuraciones')
            .select('valor')
            .eq('clave', 'tasa_bcv')
            .single()
        ]);

        const [prodRes, configRes] = await Promise.race([fetchPromise, timeoutPromise]);

        if (prodRes.error) throw prodRes.error;

        if (prodRes.data && prodRes.data.length > 0) {
          setProductos(prodRes.data);
          localStorage.setItem(CACHE_KEY_PHYSICAL, JSON.stringify(prodRes.data));
        }

        if (configRes?.data?.valor) {
          const tasaVal = parseFloat(configRes.data.valor);
          setTasa(tasaVal);
          localStorage.setItem(CACHE_KEY_TASA, String(tasaVal));
        }
      } catch (error) {
        console.warn('Aviso al cargar papelería física:', error.message);
      } finally {
        setLoading(false);
      }
    }

    obtenerProductosYTasa();
  }, []);

  return (
    <div className="shop-container">
      <div className="shop-header" style={{ textAlign: 'center', marginBottom: '40px', marginTop: '30px' }}>
        <h1 className="shop-title" style={{ color: 'var(--color-purple)', fontSize: '2.5rem', marginBottom: '10px' }}>
          Papelería Creativa &amp; Artesanal
        </h1>
        <p className="shop-subtitle" style={{ color: '#555', maxWidth: '650px', margin: '0 auto' }}>
          Cake toppers 3D, fotos tipo polaroid, libretas y piezas personalizadas elaboradas con el mayor cuidado en Venezuela. Ideales para fiestas, recuerdos y regalos especiales.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-product-card" style={{ width: '280px', borderRadius: '12px', padding: '16px', background: '#fff', border: '1px solid #eee' }}>
              <div className="skeleton-box" style={{ height: '240px', borderRadius: '8px', marginBottom: '15px' }}></div>
              <div className="skeleton-box" style={{ height: '22px', width: '75%', margin: '0 auto 12px' }}></div>
              <div className="skeleton-box" style={{ height: '24px', width: '45%', margin: '0 auto 20px' }}></div>
              <div className="skeleton-box" style={{ height: '40px', borderRadius: '25px' }}></div>
            </div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#777', padding: '60px' }}>
          <p style={{ fontSize: '1.2rem' }}>Próximamente añadiremos nuestro inventario físico disponible.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
          {productos.map(prod => {
            const preciosUSD = prod.product_variations?.map(v => Number(v.precio_venta)) || [];
            const precioMinimoUSD = preciosUSD.length > 0 ? Math.min(...preciosUSD) : 0;
            
            // Multiplicación equivalente a la de ProductsList
            const precioVES = precioMinimoUSD * tasa;

            return (
              <div key={prod.id} className="product-card physical-card-hover" style={{ border: '1px solid #e2dbdd', borderRadius: '12px', padding: '16px', width: '280px', backgroundColor: '#ffffff', boxShadow: '0 4px 15px rgba(111,35,126,0.03)', display: 'flex', flexDirection: 'column' }}>
                <img 
                  src={prod.imagen_url || 'https://via.placeholder.com/240'} 
                  alt={prod.nombre} 
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', borderRadius: '8px', height: '240px', objectFit: 'cover' }} 
                />
                
                <h3 style={{ fontSize: '1.2rem', margin: '15px 0 10px 0', color: 'var(--color-purple)', textAlign: 'center', fontWeight: 'bold' }}>
                  {prod.nombre}
                </h3>
                
                {/* Único bloque de precio: Bolívares (Bs.) */}
                <div style={{ fontWeight: '800', margin: '15px 0', fontSize: '1.4rem', color: '#dd0a68', textAlign: 'center', marginTop: 'auto' }}>
                  Bs. {precioVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={() => navigate(`/producto/${prod.id}`)} 
                    style={{ backgroundColor: 'transparent', color: '#6f237e', border: '2px solid #6f237e', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '0.9rem' }}
                  >
                    Ver Producto
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}