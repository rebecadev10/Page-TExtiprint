import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ProductsList() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasa, setTasa] = useState(1); // Tasa de cambio de la BD (por defecto 1 si falla)
  const navigate = useNavigate();
  
  const [variacionesSeleccionadas, setVariacionesSeleccionadas] = useState({});

  useEffect(() => {
    async function cargarCatalogoYTasa() {
      try {
        setLoading(true);
        
        // 1. Cargamos los productos con sus variantes
        const { data: productosData, error: productosError } = await supabase
          .from('productos')
          .select(`
            id,
            nombre,
            descripcion,
            tipo,
            imagen_url,
            product_variations (
              id,
              presentacion,
              precio_venta
            )
          `);

        if (productosError) throw productosError;
        setProductos(productosData);

        // 2. Cargamos la tasa de cambio de la tabla configuraciones de forma segura
        const { data: configData, error: configError } = await supabase
          .from('configuraciones')
          .select('valor')
          .eq('clave', 'tasa_bcv');

        // Verificamos que tengamos datos válidos en el arreglo devuelto
        if (!configError && configData && configData.length > 0) {
          const tasaNumerica = parseFloat(configData[0].valor);
          console.log("Tasa BCV cargada con éxito para Textiprint:", tasaNumerica);
          setTasa(tasaNumerica);
        } else {
          console.warn('No se pudo encontrar la tasa_bcv en la base de datos. Usando 1 por defecto.', configError);
          setTasa(1);
        }

        // Inicializamos las variantes por defecto
        const iniciales = {};
        productosData.forEach(prod => {
          if (prod.product_variations && prod.product_variations.length > 0) {
            iniciales[prod.id] = prod.product_variations[0].id;
          }
        });
        setVariacionesSeleccionadas(iniciales);

      } catch (error) {
        console.error('Error al conectar con Supabase:', error.message);
      } finally {
        setLoading(false);
      }
    }

    cargarCatalogoYTasa();
  }, []);

  const handleVariationChange = (productoId, varianteId) => {
    setVariacionesSeleccionadas(prev => ({
      ...prev,
      [productoId]: varianteId
    }));
  };

  if (loading) {
    return (
      <div className="text-center p-10 text-gray-500">
        <p className="animate-pulse">Cargando el catálogo de Textiprint...</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <p className="text-center p-5 text-gray-400">
        Pronto añadiremos productos espectaculares a nuestro catálogo.
      </p>
    );
  }

  return (
    <div className="home-featured-grid">
      {productos.map((producto) => {
        const varianteIdActual = variacionesSeleccionadas[producto.id];
        const varianteActual = producto.product_variations?.find(v => v.id === varianteIdActual);
        
        // Calculamos el precio convertido a Bolívares (VES)
        const precioUSD = varianteActual ? Number(varianteActual.precio_venta) : 0;
        const precioVES = precioUSD * tasa; // Multiplicación matemática real por la tasa de Supabase

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