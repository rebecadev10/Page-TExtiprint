import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados de datos reales de Supabase
  const [producto, setProducto] = useState(null);
  const [variaciones, setVariaciones] = useState([]);
  const [variacionSeleccionada, setVariacionSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de la interfaz interactiva
  const [email, setEmail] = useState('');
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  const [activeImg, setActiveImg] = useState(null); // Controla la foto grande actual

  // Número de WhatsApp único de Textiprint
  const telefonoWhatsApp = "584142467351"; 

  useEffect(() => {
    async function cargarDetalleProducto() {
      try {
        setLoading(true);
        // 1. Buscamos el producto base
        const { data: prodData, error: prodError } = await supabase
          .from('productos')
          .select('*')
          .eq('id', id)
          .single();

        if (prodError) throw prodError;
        setProducto(prodData);

        // 2. Buscamos las variaciones de precios asociadas
        const { data: varData, error: varError } = await supabase
          .from('product_variations')
          .select('*')
          .eq('producto_id', id)
          .order('precio_venta', { ascending: true });

        if (varError) throw varError;
        setVariaciones(varData);

        if (varData && varData.length > 0) {
          setVariacionSeleccionada(varData[0]);
        }
      } catch (error) {
        console.error('Error al cargar producto:', error.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) cargarDetalleProducto();
  }, [id]);

  if (loading) {
    return (
      <div className="shop-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: 'var(--color-purple)', fontWeight: 'bold' }}>✨ Preparando la galería creativa...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="shop-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: 'var(--color-purple)' }}>El recurso solicitado no se encuentra disponible</h2>
        <button onClick={() => navigate('/')} className="btn-primary-purple" style={{ width: 'auto', marginTop: '20px' }}>
          Volver al Inicio
        </button>
      </div>
    );
  }

  const isDigital = producto.tipo === 'digital';
  
  // --- LÓGICA DE GALERÍA DE IMÁGENES ---
  // --- LÓGICA DE GALERÍA DE IMÁGENES ---
  const mainImageFromDB = producto.imagen_url;
  
  // CORRECCIÓN: Agrupamos la principal con el array de secundarias que viene de la BD
  const secundarias = producto.imagenes_secundarias || [];
  const allImages = mainImageFromDB ? [mainImageFromDB, ...secundarias] : [...secundarias];

  const currentMainImage = activeImg || mainImageFromDB;
  const precioMostrar = variacionSeleccionada ? Number(variacionSeleccionada.precio_venta).toFixed(2) : '0.00';


  // Manejador de la acción principal del botón de compra
  const handleAction = () => {
    if (isDigital) {
      setShowDigitalModal(true);
    } else {
      // PRODUCTO FÍSICO: Redirige limpiamente a la página del formulario independiente
      // Pasamos los datos del producto y variación seleccionada en el state de la navegación
      navigate('/pedido', { 
        state: { 
          producto: producto, 
          variacionSeleccionada: variacionSeleccionada 
        } 
      });
    }
  };

  // Manejador del formulario para productos digitales (Modal de correo de Canva)
  const handleModalSubmit = (e) => {
    e.preventDefault();
    
    const nombreProducto = producto?.nombre || "";
    const presentacion = variacionSeleccionada?.presentacion || "Única";
    const precio = variacionSeleccionada?.precio_venta ? `$${variacionSeleccionada.precio_venta}` : "";

    // Construcción del mensaje prellenado para producto DIGITAL
    const mensajeDigital = `¡Hola Textiprint! 👋 Hice un pedido desde la web.\n\n` +
      `💻 *Recurso Digital:* ${nombreProducto}\n` +
      `🎨 *Presentación:* ${presentacion}\n` +
      `💰 *Monto:* ${precio}\n` +
      `📧 *Correo de Canva:* ${email}\n\n` +
      `Adjunto mi comprobante de pago para la activación. ✨`;

    // Crear el enlace URL válido utilizando la constante global del componente
    const urlWhatsApp = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeDigital)}`;
    
    // Abrir en una pestaña nueva
    window.open(urlWhatsApp, '_blank');
    setShowDigitalModal(false);
  };

  return (
    <div className="detail-container">
      {/* Botón superior de retorno */}
      <button onClick={() => navigate(-1)} className="btn-back">
        ← Volver al Catálogo
      </button>

      <div className="detail-layout">
        
        {/* ==========================================
            COLUMNA IZQUIERDA: GALERÍA COMPLETA
           ========================================== */}
        <div className="detail-gallery-col">
          <div className="main-image-container">
            {currentMainImage ? (
              <img src={currentMainImage} alt={producto.nombre} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#f8fafc' }}>
                Sin imagen de portada
              </div>
            )}
          </div>
          
          {allImages.length > 1 && (
            <div className="thumbnails-row">
              {allImages.map((img, index) => (
                <div 
                  key={index}
                  onClick={() => setActiveImg(img)}
                  className="thumbnail-item"
                  style={{ border: `2px solid ${currentMainImage === img ? 'var(--color-vivid-pink)' : 'transparent'}` }}
                >
                  <img src={img} alt={`Vista secundaria ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ==========================================
            COLUMNA DERECHA: INFORMACIÓN DEL RECURSO
           ========================================== */}
        <div className="detail-info-col">
          <span className="product-tag" style={{ color: isDigital ? 'var(--color-vivid-magenta)' : 'var(--color-vivid-pink)' }}>
            {isDigital ? 'Recurso de Edición Digital' : 'Papelería Física Textiprint'}
          </span>
          
          <h1 className="detail-title">{producto.nombre}</h1>
          
          <div className="detail-price-box">
            <span style={{ color: 'var(--color-purple)' }}>${precioMostrar} USD</span>
          </div>

          <p className="detail-desc">{producto.descripcion}</p>

          {/* Menú de Selección de Variantes de Precio */}
          {variaciones.length > 0 && (
            <div style={{ marginBottom: '24px', marginTop: '10px' }}>
              <label className="modal-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Selecciona la presentación del producto:
              </label>
              <select 
                value={variacionSeleccionada?.id || ''} 
                onChange={e => {
                  const selected = variaciones.find(v => v.id === e.target.value);
                  setVariacionSeleccionada(selected);
                }}
                className="modal-input"
                style={{ cursor: 'pointer', background: '#fff' }}
              >
                {variaciones.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.presentacion} — (${Number(v.precio_venta).toFixed(2)} USD)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tabla de especificaciones estables */}
          <div className="specs-table-container">
            <h3 className="specs-table-title">📋 Detalles del Recurso</h3>
            <table className="specs-table">
              <tbody>
                <tr>
                  <td className="specs-label">Plataforma:</td>
                  <td className="specs-value">{isDigital ? 'Canva Pro / Gratis' : 'Impresión de alta calidad'}</td>
                </tr>
                <tr>
                  <td className="specs-label">Tipo de Entrega:</td>
                  <td className="specs-value">{isDigital ? 'Enlace directo a plantilla' : 'Entrega personal / Envío'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Botón de compra unificado */}
          <button 
            onClick={handleAction}
            className="btn-action-main"
            style={{ backgroundColor: 'var(--color-purple)' }}
          >
            {isDigital ? 'Adquirir y Editar en Canva' : 'Encargar por WhatsApp'}
          </button>
        </div>

      </div>

      {/* MODAL PARA CORREO DE CANVA (RECURSOS DIGITALES) */}
      {showDigitalModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Registro de Acceso</h3>
            <p>Se activará el enlace para: <strong className="price-premium">{producto.nombre}</strong></p>
            
            <form onSubmit={handleModalSubmit}>
              <label className="modal-label">Tu Correo de Canva:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ejemplo@gmail.com" className="modal-input" />
              
              <div className="modal-info-box">
                Al presionar el botón se abrirá WhatsApp. Envíanos tu comprobante de Pago Móvil o Zinli y habilitaremos el acceso a este correo de inmediato.
              </div>

              <button type="submit" className="btn-whatsapp">
                Confirmar por WhatsApp
              </button>
            </form>
            <button onClick={() => setShowDigitalModal(false)} className="btn-cancel">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}