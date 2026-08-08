import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados del producto
  const [producto, setProducto] = useState(null);
  const [variaciones, setVariaciones] = useState([]);
  const [variacionSeleccionada, setVariacionSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasaCambio, setTasaCambio] = useState(1);

  // Estados del Modal Digital
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  const [email, setEmail] = useState('');

  // Teléfono configurado para WhatsApp
  const telefonoWhatsApp = "584142467351";

  // Cargar producto, variaciones y tasa de cambio
  useEffect(() => {
    const fetchProductoYDatos = async () => {
      try {
        setLoading(true);

        // 1. Obtener producto
        const { data: prodData, error: prodError } = await supabase
          .from('productos')
          .select('*')
          .eq('id', id)
          .single();

        if (prodError) throw prodError;
        setProducto(prodData);

        // 2. Obtener variaciones del producto
        const { data: varData, error: varError } = await supabase
          .from('product_variations')
          .select('*')
          .eq('producto_id', id);

        if (varError) throw varError;
        setVariaciones(varData || []);
        if (varData && varData.length > 0) {
          setVariacionSeleccionada(varData[0]);
        }

        // 3. Obtener Tasa BCV desde configuraciones
        const { data: configData } = await supabase
          .from('configuraciones')
          .select('valor')
          .eq('clave', 'tasa_bcv')
          .single();

        if (configData?.valor) {
          setTasaCambio(configData.valor);
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
    const partes = usuario.split(/[\._\-]/).filter(Boolean);
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
    setLoading(true);

    try {
      const nombreProducto = producto?.nombre || "";
      const presentacion = variacionSeleccionada?.presentacion || "Única";
      const precioUsd = variacionSeleccionada?.precio_venta || 0;
      const variationId = variacionSeleccionada?.id || (variaciones.length > 0 ? variaciones[0].id : null);

      // Conversión exacta a Bolívares
      const precioBs = (Number(precioUsd) * Number(tasaCambio)).toFixed(2);

      // 1. Buscar o Registrar Cliente con nombre derivado del correo
      let clienteId = null;

      const { data: clientesExistentes, error: searchError } = await supabase
        .from('clientes')
        .select('id')
        .eq('correo', email)
        .limit(1);

      if (searchError) throw searchError;

      if (clientesExistentes && clientesExistentes.length > 0) {
        clienteId = clientesExistentes[0].id;
      } else {
        const { nombre: nombreExtraido, apellido: apellidoExtraido } = extraerNombreDeCorreo(email);

        const { data: nuevoCliente, error: errCliente } = await supabase
          .from('clientes')
          .insert([
            {
              nombre: nombreExtraido,
              apellido: apellidoExtraido,
              telefono: '00000000000',
              correo: email,
              origen: 'pagina_web',
              ubicacion: 'Caracas'
            }
          ])
          .select()
          .single();

        if (errCliente) throw errCliente;
        clienteId = nuevoCliente.id;
      }

      // 2. Registrar Pedido
      const { data: pedido, error: errPedido } = await supabase
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

      // 3. Registrar Ítem de Pedido
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

        if (errItem) throw errItem;
      }

      // 4. Registrar Venta
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

      // 5. Generar Mensaje de WhatsApp mostrando ÚNICAMENTE el monto en Bolívares
      const numeroOrden = pedido.id.slice(0, 8).toUpperCase();
      
      const mensajeDigital = 
        `¡Hola Textiprint! 👋✨\n\n` +
        `Adquirí un recurso digital desde la web.\n\n` +
        `📦 *Orden:* #${numeroOrden}\n` +
        `💻 *Recurso Digital:* ${nombreProducto}\n` +
        `🎨 *Presentación:* ${presentacion}\n` +
        `💰 *Monto a cancelar:* Bs. ${precioBs}\n` +
        `📧 *Correo de Canva:* ${email}\n\n` +
        `Adjunto mi comprobante de pago para la activación.`;

      const urlWhatsApp = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeDigital)}`;
      
      window.open(urlWhatsApp, '_blank');
      setShowDigitalModal(false);

    } catch (error) {
      console.error('Error al procesar la orden digital:', error);
      alert(`Ocurrió un detalle al guardar la orden: ${error.message || 'Intente nuevamente'}`);
    } finally {
      setLoading(false);
    }
  };

  // Botón de acción principal
  const handleAccionCompra = () => {
    if (producto?.tipo === 'digital') {
      setShowDigitalModal(true);
    } else {
      navigate(`/hacer-pedido?productoId=${producto?.id}&variationId=${variacionSeleccionada?.id}`);
    }
  };

  if (loading && !producto) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando producto...</div>;
  }

  if (!producto) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Producto no encontrado.</div>;
  }

  const precioActualUsd = variacionSeleccionada?.precio_venta || 0;
  const precioActualBs = (precioActualUsd * tasaCambio).toFixed(2);

  ret
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
          
          {/* Precio Principal en Bolívares */}
          <div className="detail-price-box">
            <span style={{ color: 'var(--color-purple)' }}>{precioFormateadoBs}</span>
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
                {variaciones.map(v => {
                  const vesVal = Number(v.precio_venta) * tasa;
                  const bsFormatted = vesVal.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  return (
                    <option key={v.id} value={v.id}>
                      {v.presentacion} — (Bs. {bsFormatted})
                    </option>
                  );
                })}
              </select>
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
            <p style={{ marginTop: '5px', fontSize: '0.95rem', color: '#555' }}>
              Monto a transferir: <strong style={{ color: 'var(--color-vivid-pink)' }}>{precioFormateadoBs}</strong>
            </p>
            
            <form onSubmit={handleModalSubmit}>
              <label className="modal-label">Tu Correo de Canva:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ejemplo@gmail.com" className="modal-input" />
              
              <div className="modal-info-box">
                Al presionar el botón se abrirá WhatsApp. Envíanos tu comprobante de Pago Móvil y habilitaremos el acceso a este correo de inmediato.
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