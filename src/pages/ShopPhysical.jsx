import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ShopPhysical() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasa, setTasa] = useState(1); // Tasa de cambio de la BD

  useEffect(() => {
    async function obtenerProductosYTasa() {
      try {
        setLoading(true);

        // 1. Traemos los productos físicos
        const { data: productosData, error: productosError } = await supabase
          .from('productos')
          .select('id, nombre, tipo, imagen_url, product_variations(precio_venta)')
          .eq('tipo', 'fisico')
          .order('nombre');

        if (productosError) throw productosError;
        setProductos(productosData);

        // 2. Traemos la tasa BCV desde configuraciones
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
        console.error('Error al cargar papelería física o tasa:', error.message);
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
          Papelería Artesanal y Creativa
        </h1>
        <p className="shop-subtitle" style={{ color: '#555', maxWidth: '600px', margin: '0 auto' }}>
          Piezas físicas diseñadas y elaboradas con el mayor cuidado. Perfectas para regalos, organización personal o corporativa.
        </p>
      </div>

      {loading ? (
        <p className="text-loading" style={{ textAlign: 'center', padding: '40px' }}>Cargando catálogo físico...</p>
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
              <div key={prod.id} className="product-card" style={{ border: '1px solid #e2dbdd', borderRadius: '12px', padding: '16px', width: '280px', backgroundColor: '#ffffff', boxShadow: '0 4px 15px rgba(111,35,126,0.03)', display: 'flex', flexDirection: 'column' }}>
                <img 
                  src={prod.imagen_url || 'https://via.placeholder.com/240'} 
                  alt={prod.nombre} 
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