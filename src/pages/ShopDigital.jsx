import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ShopDigital() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasa, setTasa] = useState(1); // Tasa de cambio de la BD
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
        setLoading(true);

        // 1. Buscamos las plantillas digitales
        const { data: productosData, error: productosError } = await supabase
          .from('productos')
          .select('id, nombre, tipo, imagen_url, product_variations(precio_venta)')
          .eq('tipo', 'digital')
          .order('nombre');

        if (productosError) throw productosError;
        setProductos(productosData);

        // 2. Traemos la tasa de cambio
        const { data: configData, error: configError } = await supabase
          .from('configuraciones')
          .select('valor')
          .eq('clave', 'tasa_bcv');

        if (!configError && configData && configData.length > 0) {
          setTasa(parseFloat(configData[0].valor));
        } else {
          setTasa(1);
        }

      } catch (error) {
        console.error('Error al cargar plantillas o tasa:', error.message);
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
        <p className="text-loading" style={{ textAlign: 'center' }}>Cargando plantillas de Canva...</p>
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
              <div key={temp.id} style={{ border: '1px solid #e2dbdd', borderRadius: '12px', padding: '16px', width: '280px', textAlign: 'center', backgroundColor: colors.whitePure, boxShadow: '0 4px 15px rgba(111,35,126,0.03)', display: 'flex', flexDirection: 'column' }}>
                <img 
                  src={temp.imagen_url || 'https://via.placeholder.com/240'} 
                  alt={temp.nombre} 
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
                    onClick={() => navigate(`/producto/${temp.id}`)} 
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