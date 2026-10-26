import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Estados del producto
  const [producto, setProducto] = useState(null);
  const [variaciones, setVariaciones] = useState([]);
  const [variacionSeleccionada, setVariacionSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const isSubmittingRef = useRef(false);
  const [tasaCambio, setTasaCambio] = useState(1);

  // Estados del Modal Digital y Galería
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  const [email, setEmail] = useState('');
  const [currentMainImage, setCurrentMainImage] = useState('');

  // Teléfono configurado para WhatsApp
  const telefonoWhatsApp = "584142467351";

  // Cargar producto, variaciones y tasa de cambio en paralelo (3x más rápido)
  useEffect(() => {
    const fetchProductoYDatos = async () => {
      try {
        setLoading(true);

        const [prodRes, varRes, configRes] = await Promise.all([
          supabase.from('productos').select('*').eq('id', id).single(),
          supabase.from('product_variations').select('*').eq('producto_id', id),
          supabase.from('configuraciones').select('valor').eq('clave', 'tasa_bcv').single()
        ]);

        if (prodRes.error) throw prodRes.error;
        setProducto(prodRes.data);

        if (prodRes.data?.imagen_url) {
          setCurrentMainImage(prodRes.data.imagen_url);
        }

        const variations = varRes.data || [];
        setVariaciones(variations);
        if (variations.length > 0) {
          setVariacionSeleccionada(variations[0]);
        }

        if (configRes.data?.valor) {
          setTasaCambio(configRes.data.valor);
        }

      } catch (err) {
        console.error('Error al cargar detalle del producto:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductoYDatos();
  }, [id]);

  // Extraer Nombre y Apellido a partir del Correo Electrónico
  const extraerNombreDeCorreo = (correo) => {
    if (!correo) return { nombre: 'Cliente', apellido: 'Digital' };
    
    const usuario = correo.split('@')[0];
    const partes = usuario.split(/[._-]/).filter(Boolean);
    const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    if (partes.length >= 2) {
      return {
        nombre: capitalizar(partes[0]),
        apellido: capitalizar(partes[1])
      };
    } else if (partes.length === 1) {
      return {
        nombre: capitalizar(partes[0]),
        apellido: 'Digital'
      };
    }

    return { nombre: 'Cliente', apellido: 'Digital' };
  };

  // Manejo del envío del modal para productos digitales
  const handleModalSubmit = async (e) => {
    e.preventDefault();

    // 1. BLOQUEO INMEDIATO ANTI DOBLE CLIC (Ref sincrónico + estado)
    if (isSubmittingRef.current || submittingOrder) return;
    isSubmittingRef.current = true;
    setSubmittingOrder(true);

    try {
      const nombreProducto = producto?.nombre || "";
      const presentacion = variacionSeleccionada?.presentacion || "Única";
      const precioUsd = variacionSeleccionada?.precio_venta || 0;
      const variationId = variacionSeleccionada?.id || (variaciones.length > 0 ? variaciones[0].id : null);
      const cleanCorreo = (email || '').trim().toLowerCase();

      // 2. REUTILIZAR CLIENTE EXISTENTE (Buscar por correo)
      let clienteId = null;

      const { data: clientesExistentes, error: searchError } = await supabase
        .from('clientes')
        .select('id, nombre, apellido, correo, telefono, ubicacion')
        .ilike('correo', cleanCorreo)
        .limit(1);

      if (searchError) throw searchError;

      if (clientesExistentes && clientesExistentes.length > 0) {
        clienteId = clientesExistentes[0].id;
      } else {
        const { nombre: nombreExtraido, apellido: apellidoExtraido } = extraerNombreDeCorreo(cleanCorreo);

        const { data: nuevoCliente, error: errCliente } = await supabase
          .from('clientes')
          .insert([
            {
              nombre: nombreExtraido,
              apellido: apellidoExtraido,
              telefono: '00000000000',
              correo: cleanCorreo,
              origen: 'pagina_web',
              ubicacion: 'Caracas'
            }
          ])
          .select()
          .single();

        if (errCliente) throw errCliente;
        clienteId = nuevoCliente.id;
      }

      // 3. FILTRO ANTI-DUPLICADO DE PEDIDO Y VENTA (Últimos 2 minutos con mismo cliente y mismo monto)
      const dosMinutosAtras = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      let pedido = null;

      const { data: pedidosRecientes, error: errBusqPedido } = await supabase
        .from('pedidos')
        .select('id, total_pedido, registro')
        .eq('cliente_id', clienteId)
        .gte('registro', dosMinutosAtras)
        .order('registro', { ascending: false })
        .limit(1);

      const esDuplicado = !errBusqPedido && pedidosRecientes && pedidosRecientes.length > 0 &&
        Math.abs(Number(pedidosRecientes[0].total_pedido) - Number(precioUsd)) < 0.01;

      if (esDuplicado) {
        console.warn('Filtro anti-duplicado activo: Se detectó orden digital idéntica en los últimos 2 minutos. Reutilizando orden:', pedidosRecientes[0].id);
        pedido = pedidosRecientes[0];
      } else {
        // Registrar Pedido
        const { data: nuevoPedido, error: errPedido } = await supabase
          .from('pedidos')
          .insert([
            {
              cliente_id: clienteId,
              estado: 'pendiente',
              total_pedido: precioUsd
            }
          ])
          .select()
          .single();

        if (errPedido) throw errPedido;
        pedido = nuevoPedido;

        // Registrar Ítem de Pedido
        if (variationId) {
          const { error: errItem } = await supabase
            .from('pedido_items')
            .insert([
              {
                pedido_id: pedido.id,
                variation_id: variationId,
                cantidad: 1,
                precio_unitario: precioUsd
              }
            ]);

          if (errItem) console.warn('Aviso en pedido_items:', errItem.message);
        }

        // Registrar Venta
        const { error: errVenta } = await supabase
          .from('ventas')
          .insert([
            {
              cliente_id: clienteId,
              canal: 'tienda_online',
              total_venta: precioUsd,
              estado: 'pendiente'
            }
          ]);

        if (errVenta) console.warn('Aviso en ventas:', errVenta.message);
      }

      // 4. Generar Mensaje de WhatsApp mostrando ÚNICAMENTE el monto en Bolívares
      const precioFormateado = (Number(precioUsd) * Number(tasaCambio)).toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const mensajeDigital = 
        `¡Hola Textiprint! 👋 Hice un pedido desde la web.\n\n` +
        `💻 *Recurso Digital:* ${nombreProducto}\n` +
        `🎨 *Presentación:* ${presentacion}\n` +
        `💰 *Monto a pagar:* Bs. ${precioFormateado}\n` +
        `📧 *Correo de Canva:* ${cleanCorreo}\n\n` +
        `Adjunto mi comprobante de pago para la activación. ✨`;

      const urlWhatsApp = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeDigital)}`;
      
      window.open(urlWhatsApp, '_blank');
      setShowDigitalModal(false);

    } catch (error) {
      console.error('Error al procesar la orden digital:', error);
      alert(`Ocurrió un detalle al guardar la orden: ${error.message || 'Intente nuevamente'}`);
    } finally {
      setSubmittingOrder(false);
      isSubmittingRef.current = false;
    }
  };

  // Manejo de acciones de compra y carrito
  const handleAddToCart = () => {
    if (!variacionSeleccionada && variaciones.length > 0) {
      alert('Por favor selecciona una presentación.');
      return;
    }
    const varToUse = variacionSeleccionada || { id: 'default', presentacion: 'Estándar', precio_venta: producto?.precio || 0 };
    addToCart(producto, varToUse, 1);
  };

  const handleBuyNow = () => {
    if (!variacionSeleccionada && variaciones.length > 0) {
      alert('Por favor selecciona una presentación.');
      return;
    }
    const varToUse = variacionSeleccionada || { id: 'default', presentacion: 'Estándar', precio_venta: producto?.precio || 0 };
    addToCart(producto, varToUse, 1);
    navigate('/pedido');
  };

  const handleAction = () => {
    if (producto?.tipo === 'digital') {
      setShowDigitalModal(true);
    } else {
      handleAddToCart();
    }
  };

  if (loading && !producto) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando producto...</div>;
  }

  if (!producto) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Producto no encontrado.</div>;
  }

  // Variables derivadas para renderizado
  const isDigital = producto?.tipo === 'digital';
  const tasa = Number(tasaCambio) || 1;
  const precioActualUsd = variacionSeleccionada?.precio_venta || 0;
  const vesCalculado = Number(precioActualUsd) * tasa;
  const precioFormateadoBs = `Bs. ${vesCalculado.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  // Lista unificada de imágenes
  const allImages = [
    producto?.imagen_url,
    ...(Array.isArray(producto?.imagenes_secundarias) ? producto.imagenes_secundarias : [])
  ].filter(Boolean);

  const setActiveImg = (imgUrl) => {
    setCurrentMainImage(imgUrl);
  };

  return (
    <div className="detail-container">
      {/* Botón superior de retorno */}
      <button onClick={() => navigate(-1)} className="btn-back">
        ← Volver al Catálogo
      </button>

      <div className="detail-layout">
        
        {/* COLUMNA IZQUIERDA: GALERÍA COMPLETA */}
        <div className="detail-gallery-col">
          <div className="main-image-container">
            {currentMainImage ? (
              <img src={currentMainImage} alt={producto.nombre} decoding="async" />
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
                  <img src={img} alt={`Vista secundaria ${index + 1}`} loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN DEL RECURSO */}
        <div className="detail-info-col">
          <span className="product-tag" style={{ color: isDigital ? 'var(--color-vivid-magenta)' : 'var(--color-vivid-pink)' }}>
            {isDigital ? 'Recurso de Edición Digital' : 'Papelería Física Textiprint'}
          </span>
          
          <h1 className="detail-title">{producto.nombre}</h1>
          
          {/* Precio Principal en Bolívares */}
          <div className="detail-price-hero">
            <div className="detail-price-main-row">
              <span className="price-bs-large">{precioFormateadoBs}</span>
            </div>
            {variacionSeleccionada && (
              <div className="price-bcv-row">
                <span className="price-selected-label">
                  {variacionSeleccionada.presentacion}
                </span>
              </div>
            )}
          </div>

          <p className="detail-desc">{producto.descripcion}</p>

          {/* Selector de Variantes con Cards / Cuadritos Interactivos */}
          {variaciones.length > 0 && (
            <div className="variant-selection-section">
              <div className="variant-header-row">
                <span className="variant-section-title">
                  Elige tu presentación:
                </span>
                <span className="variant-count-badge">
                  {variaciones.length} {variaciones.length === 1 ? 'opción' : 'opciones'}
                </span>
              </div>

              <div 
                className="variant-cards-grid" 
                role="radiogroup" 
                aria-label="Selecciona la presentación del producto"
              >
                {variaciones.map((v) => {
                  const isSelected = variacionSeleccionada?.id === v.id;
                  const vesVal = Number(v.precio_venta) * tasa;
                  const bsFormatted = vesVal.toLocaleString('es-VE', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  });

                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setVariacionSeleccionada(v)}
                      className={`variant-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="variant-card-header">
                        <span className="variant-card-title">{v.presentacion}</span>
                        <div className={`variant-radio-circle ${isSelected ? 'active' : ''}`}>
                          {isSelected && <div className="variant-radio-dot" />}
                        </div>
                      </div>

                      <div className="variant-card-pricing">
                        <span className="variant-card-bs">Bs. {bsFormatted}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tabla de especificaciones */}
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

          {/* Botones de acción */}
          <div className="product-actions-group">
            <button 
              type="button"
              onClick={handleAddToCart}
              className="btn-add-to-cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Agregar al Carrito
            </button>

            {isDigital ? (
              <button 
                type="button"
                onClick={() => setShowDigitalModal(true)}
                className="btn-buy-now"
              >
                ⚡ Adquirir Ahora (Canva)
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleBuyNow}
                className="btn-buy-now"
              >
                ⚡ Pedir Directamente
              </button>
            )}
          </div>
        </div>

      </div>

      {/* MODAL PARA CORREO DE CANVA (RECURSOS DIGITALES) */}
      {showDigitalModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Registro de Acceso</h3>
            <p>Se activará el enlace para: <strong className="price-premium">{producto.nombre}</strong></p>
            <p style={{ marginTop: '5px', fontSize: '0.95rem', color: '#555' }}>
              Monto a transferir: <strong style={{ color: 'var(--color-vivid-pink)' }}>{precioFormateadoBs}</strong>
            </p>
            
            <form onSubmit={handleModalSubmit}>
              <label className="modal-label">Tu Correo de Canva:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ejemplo@gmail.com" className="modal-input" />
              
              <div className="modal-info-box">
                Al presionar el botón se abrirá WhatsApp. Envíanos tu comprobante de Pago Móvil y habilitaremos el acceso a este correo de inmediato.
              </div>

              <button type="submit" className="btn-whatsapp" disabled={submittingOrder}>
                {submittingOrder ? "Procesando pedido..." : "Confirmar por WhatsApp"}
              </button>
            </form>
            <button onClick={() => setShowDigitalModal(false)} className="btn-cancel">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}