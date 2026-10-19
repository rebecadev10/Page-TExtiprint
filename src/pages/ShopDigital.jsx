import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const CACHE_KEY_DIGITAL = 'textiprint_cached_digital';
const CACHE_KEY_TASA = 'textiprint_cached_tasa';

export default function ShopDigital() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_DIGITAL);
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
      const cached = localStorage.getItem(CACHE_KEY_DIGITAL);
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [email, setEmail] = useState('');

  const colors = {
    purple: '#6f237e',
    yellow: '#ffbc2f',
    vividPink: '#dd0a68',
    vividMagenta: '#f84eab',
    white: '#fffafb',
    whitePure: '#ffffff',
    black: '#000000'
  };

  useEffect(() => {
    async function obtenerPlantillasYTasa() {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de red')), 10000)
        );

        const fetchPromise = Promise.all([
          supabase
            .from('productos')
            .select('id, nombre, tipo, imagen_url, product_variations(precio_venta)')
            .eq('tipo', 'digital')
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
          localStorage.setItem(CACHE_KEY_DIGITAL, JSON.stringify(prodRes.data));
        }

        if (configRes?.data?.valor) {
          const tasaVal = parseFloat(configRes.data.valor);
          setTasa(tasaVal);
          localStorage.setItem(CACHE_KEY_TASA, String(tasaVal));
        }
      } catch (error) {
        console.warn('Aviso al cargar plantillas digitales:', error.message);
      } finally {
        setLoading(false);
      }
    }

    obtenerPlantillasYTasa();
  }, []);

  const handleOpenModal = (template) => {
    setSelectedTemplate(template);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    const phoneNumber = "584142467351";
    const preciosUSD = selectedTemplate.product_variations?.map(v => Number(v.precio_venta)) || [];
    const precioMinimoUSD = preciosUSD.length > 0 ? Math.min(...preciosUSD) : 0;
    const precioVES = precioMinimoUSD * tasa;
    const isFree = precioMinimoUSD === 0;

    const precioTextoBs = `Bs. ${precioVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let message = "";
    if (isFree) {
      message = `¡Hola Textiprint! Me interesa la plantilla GRATUITA: "${selectedTemplate.nombre}".%0AMi correo registrado para Canva es: ${email}`;
    } else {
      message = `¡Hola Textiprint! Quiero adquirir la plantilla premium: "${selectedTemplate.nombre}" (${precioTextoBs} / $${precioMinimoUSD.toFixed(2)} USD).%0AMi correo para Canva es: ${email}.%0AAdjunto mi comprobante de pago:`;
    }

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    setSelectedTemplate(null);
    setEmail('');
  };

  return (
    <div style={{ padding: '60px 5%', backgroundColor: colors.white, minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ color: colors.purple, fontSize: '2.5rem', margin: '0 0 10px 0' }}>Plantillas Digitales</h1>
        <p style={{ color: '#555', maxWidth: '600px', margin: '0 auto' }}>
          Potencia tus diseños con nuestros recursos listos para editar directamente en Canva.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
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
        <div style={{ textAlign: 'center', color: '#777', padding: '40px' }}>
          <p style={{ fontSize: '1.2rem' }}>Próximamente añadiremos nuestras plantillas editables.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          {productos.map(temp => {
            const preciosUSD = temp.product_variations?.map(v => Number(v.precio_venta)) || [];
            const precioMinimoUSD = preciosUSD.length > 0 ? Math.min(...preciosUSD) : 0;
            const precioVES = precioMinimoUSD * tasa;
            const isFree = precioMinimoUSD === 0;

            return (
              <div key={temp.id} className="digital-card-hover" style={{ border: '1px solid #e2dbdd', borderRadius: '12px', padding: '16px', width: '280px', textAlign: 'center', backgroundColor: colors.whitePure, boxShadow: '0 4px 15px rgba(111,35,126,0.03)', display: 'flex', flexDirection: 'column' }}>
                <img 
                  src={temp.imagen_url || 'https://via.placeholder.com/240'} 
                  alt={temp.nombre} 
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', borderRadius: '8px', height: '240px', objectFit: 'cover' }} 
                />
                <h3 style={{ fontSize: '1.2rem', margin: '15px 0 10px 0', color: colors.purple, fontWeight: 'bold' }}>
                  {temp.nombre}
                </h3>
                
                {/* Precio formateado a Bs. */}
                <div style={{ fontWeight: 'bold', margin: '15px 0', fontSize: '1.3rem', marginTop: 'auto' }}>
                  {isFree ? (
                    <span style={{ color: colors.vividMagenta }}>¡Gratis!</span>
                  ) : (
                    <span style={{ color: colors.vividPink }}>
                      Bs. {precioVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                  <button 
                    onClick={() => navigate(`/producto/${temp.id}`)}
                    style={{ backgroundColor: 'transparent', color: colors.purple, border: `2px solid ${colors.purple}`, padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '0.9rem' }}
                  >
                    Ver Detalles
                  </button>
                  
                  <button 
                    onClick={() => handleOpenModal(temp)} 
                    style={{ backgroundColor: isFree ? colors.vividMagenta : colors.purple, color: 'white', border: 'none', padding: '11px 20px', borderRadius: '25px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '0.9rem' }}
                  >
                    {isFree ? 'Obtener Gratis' : 'Comprar Ahora'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL INTERACTIVO */}
      {selectedTemplate && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: colors.white, padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <h3 style={{ color: colors.purple, marginTop: 0, fontSize: '1.4rem' }}>
              { (selectedTemplate.product_variations?.map(v => Number(v.precio_venta))[0] || 0) === 0 ? 'Acceso Gratuito' : 'Confirmar Pedido' }
            </h3>
            <p style={{ fontSize: '0.95rem' }}>Recurso: <strong style={{ color: colors.vividPink }}>{selectedTemplate.nombre}</strong></p>
            
            <form onSubmit={handleFormSubmit}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Ingresa tu correo electrónico asociado a Canva:
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="ejemplo@gmail.com" 
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', marginBottom: '20px', borderRadius: '8px', border: `1px solid ${colors.purple}`, fontSize: '1rem' }} 
              />
              
              {(selectedTemplate.product_variations?.map(v => Number(v.precio_venta))[0] || 0) > 0 && (
                <div style={{ backgroundColor: '#fffbe6', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', borderLeft: `4px solid ${colors.yellow}`, lineHeight: '1.4' }}>
                  <strong>Información de Pago Móvil / Cambios:</strong> Al hacer clic en el botón inferior se abrirá tu chat de WhatsApp. Por allí nos envías el comprobante de pago y te daremos acceso al correo indicado.
                </div>
              )}

              <button type="submit" style={{ backgroundColor: '#25D366', color: 'white', border: 'none', padding: '14px', width: '100%', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                {(selectedTemplate.product_variations?.map(v => Number(v.precio_venta))[0] || 0) === 0 ? 'Solicitar por WhatsApp' : 'Enviar Comprobante por WhatsApp'}
              </button>
            </form>
            
            <button onClick={() => setSelectedTemplate(null)} style={{ background: 'none', border: 'none', color: '#888', width: '100%', marginTop: '15px', cursor: 'pointer', fontSize: '0.9rem' }}>
              Cancelar y volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}