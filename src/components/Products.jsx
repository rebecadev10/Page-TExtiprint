import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CACHE_KEY_PRODUCTS = 'textiprint_cached_products';
const CACHE_KEY_TASA = 'textiprint_cached_tasa';

export default function ProductsList() {
  // 1. Inicializamos desde caché para renderizado instantáneo (0.0s sin skeletons)
  const [productos, setProductos] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_PRODUCTS);
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

  // Si ya tenemos productos en caché, NO mostramos skeletons bloqueantes
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_PRODUCTS);
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });

  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();

  const [variacionesSeleccionadas, setVariacionesSeleccionadas] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_PRODUCTS);
      if (cached) {
        const parsed = JSON.parse(cached);
        const iniciales = {};
        parsed.forEach(prod => {
          if (prod.product_variations && prod.product_variations.length > 0) {
            iniciales[prod.id] = prod.product_variations[0].id;
          }
        });
        return iniciales;
      }
    } catch {}
    return {};
  });

  const cargarCatalogoYTasa = useCallback(async () => {
    try {
      // Peticiones en paralelo con Promise.all y timeout de seguridad de 10 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tiempo de espera de red')), 10000)
      );

      const fetchPromise = Promise.all([
        supabase
          .from('productos')
          .select(`
            id,
            nombre,
            tipo,
            imagen_url,
            product_variations (
              id,
              presentacion,
              precio_venta
            )
          `)
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
        localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(prodRes.data));

        // Inicializamos las variantes
        const iniciales = {};
        prodRes.data.forEach(prod => {
          if (prod.product_variations && prod.product_variations.length > 0) {
            iniciales[prod.id] = prod.product_variations[0].id;
          }
        });
        setVariacionesSeleccionadas(iniciales);
      }

      if (configRes?.data?.valor) {
        const tasaNum = parseFloat(configRes.data.valor);
        setTasa(tasaNum);
        localStorage.setItem(CACHE_KEY_TASA, String(tasaNum));
      }

      setFetchError(null);
    } catch (error) {
      console.warn('Aviso de carga en catálogo Textiprint:', error.message);
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCatalogoYTasa();
  }, [cargarCatalogoYTasa]);

  const handleVariationChange = (productoId, varianteId) => {
    setVariacionesSeleccionadas(prev => ({
      ...prev,
      [productoId]: varianteId
    }));
  };

  // Solo mostramos skeleton si NO hay productos previos en caché y aún está cargando
  if (loading && productos.length === 0) {
    return (
      <div className="home-featured-grid">
        {[1, 2, 3].map((n) => (
          <div key={n} className="featured-item-card skeleton-product-card" style={{ opacity: 0.85 }}>
            <div className="skeleton-box" style={{ height: '240px', width: '100%', borderRadius: '16px', marginBottom: '14px' }}></div>
            <div className="skeleton-box" style={{ height: '22px', width: '70%', margin: '0 auto 12px' }}></div>
            <div className="skeleton-box" style={{ height: '36px', width: '100%', borderRadius: '8px', marginBottom: '12px' }}></div>
            <div className="skeleton-box" style={{ height: '26px', width: '40%', margin: '0 auto 14px' }}></div>
            <div className="skeleton-box" style={{ height: '42px', width: '100%', borderRadius: '25px' }}></div>
          </div>
        ))}
      </div>
    );
  }

  // Si falló y no hay nada en caché
  if (productos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛍️</div>
        <p style={{ fontSize: '1.1rem', marginBottom: '18px', maxWidth: '480px', margin: '0 auto 18px' }}>
          {fetchError 
            ? 'La conexión con el catálogo tardó un poco más de lo habitual.' 
            : 'Pronto añadiremos productos espectaculares a nuestro catálogo.'}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            cargarCatalogoYTasa();
          }}
          className="btn-home-purple"
          style={{ padding: '12px 28px', fontSize: '0.95rem' }}
        >
          🔄 Cargar productos
        </button>
      </div>
    );
  }

  return (
    <div className="home-featured-grid">
      {productos.map((producto) => {
        const varianteIdActual = variacionesSeleccionadas[producto.id];
        const varianteActual = producto.product_variations?.find(v => v.id === varianteIdActual);
        
        // Calculamos el precio convertido ÚNICAMENTE a Bolívares (VES)
        const precioUSD = varianteActual ? Number(varianteActual.precio_venta) : 0;
        const precioVES = precioUSD * tasa;

        return (
          <div 
            key={producto.id} 
            onClick={() => navigate(`/producto/${producto.id}`)}
            className="featured-item-card"
          >
            {/* Imagen del producto en caja rosa pastel */}
            <div className="featured-item-img-box">
              <img 
                src={producto.imagen_url || 'https://via.placeholder.com/300x350?text=Textiprint'} 
                alt={producto.nombre} 
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Título */}
            <h4 className="featured-item-title">{producto.nombre}</h4>

            {/* Controles y precio */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="featured-item-controls"
            >
              {/* Selector de variantes */}
              {producto.product_variations && producto.product_variations.length > 0 ? (
                <div className="featured-item-select-wrapper">
                  <select 
                    value={varianteIdActual || ''} 
                    onChange={(e) => handleVariationChange(producto.id, e.target.value)}
                    className="featured-item-select"
                    aria-label={`Seleccionar presentación para ${producto.nombre}`}
                  >
                    {producto.product_variations.map((variacion) => (
                      <option key={variacion.id} value={variacion.id}>
                        {variacion.presentacion}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p style={{ fontSize: '0.75rem', color: '#ff4d4d', textAlign: 'center' }}>Sin precios configurados</p>
              )}

              {/* Único bloque de precio: Solo Bolívares (Bs.) */}
              <div className="featured-item-price">
                Bs. {precioVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              {/* Botón */}
              <button 
                onClick={() => navigate(`/producto/${producto.id}`)}
                className="btn-home-purple"
              >
                Ver Producto
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
}