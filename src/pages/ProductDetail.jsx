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
  const [tasa, setTasa] = useState(1); // Tasa de cambio de la BD
  
  // Estados de la interfaz interactiva
  const [email, setEmail] = useState('');
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  const [activeImg, setActiveImg] = useState(null); // Controla la foto grande actual

  // Número de WhatsApp único de Textiprint
  const telefonoWhatsApp = "584142467351"; 

  useEffect(() => {
    async function cargarDetalleProductoYTasa() {
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

        // 3. Cargamos la tasa BCV desde la tabla configuraciones
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
        console.error('Error al cargar producto:', error.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) cargarDetalleProductoYTasa();
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
  const mainImageFromDB = producto.imagen_url;
  const secundarias = producto.imagenes_secundarias || [];
  const allImages = mainImageFromDB ? [mainImageFromDB, ...secundarias] : [...secundarias];
  const currentMainImage = activeImg || mainImageFromDB;

  // --- CÁLCULO EN BOLÍVARES (VES) ---
  const precioUSD = variacionSeleccionada ? Number(variacionSeleccionada.precio_venta) : 0;
  const precioVES = precioUSD * tasa;
  const precioFormateadoBs = `Bs. ${precioVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Manejador de la acción principal del botón de compra
  const handleAction = () => {
    if (isDigital) {
      setShowDigitalModal(true);
    } else {
      // PRODUCTO FÍSICO: Redirige al formulario independiente enviando el precio calculado en Bs y la tasa
      navigate('/pedido', { 
        state: { 
          producto: producto, 
          variacionSeleccionada: variacionSeleccionada,
          precioVES: precioVES,
          tasa: tasa
        } 
      });
    }
  };

  // Manejador del formulario para productos digitales (Modal de correo de Canva)
  // 1. Asegúrate de que Supabase esté importado al inicio del archivo[cite: 2]
// import { supabase } from '../supabaseClient';

const handleModalSubmit = async (e) => {
  e.preventDefault();
  setLoading(true); // O un estado para deshabilitar el botón si lo tienes

  try {
    const nombreProducto = producto?.nombre || "";
    const presentacion = variacionSeleccionada?.presentacion || "Única";
    const precio = variacionSeleccionada?.precio_venta || 0;

    // ------------------------------------------------------------------
    // 1. REGISTRAR O BUSCAR CLIENTE (Guardamos su correo de Canva)
    // ------------------------------------------------------------------
    let clienteId = null;

    // Buscamos si el correo de Canva ya existe en la tabla clientes
    const { data: clientesExistentes } = await supabase
      .from('clientes')
      .select('id')
      .eq('correo', email)
      .limit(1);

    if (clientesExistentes && clientesExistentes.length > 0) {
      clienteId = clientesExistentes[0].id;
    } else {
      // Creamos el registro del cliente con su correo de Canva
      const { data: nuevoCliente, error: errCliente } = await supabase
        .from('clientes')
        .insert([
          {
            nombre: 'Cliente',
            apellido: 'Digital',
            telefono: 'Sin teléfono', // Puedes agregar un input de teléfono si lo deseas
            correo: email,           // Guardamos el correo ingresado en el modal
            origen: 'web',            // Ajusta según los valores permitidos de tu Enum
            ubicacion: 'digital'      // Ajusta según los valores permitidos de tu Enum
          }
        ])
        .select()
        .single();

      if (errCliente) throw errCliente;
      clienteId = nuevoCliente.id;
    }

    // ------------------------------------------------------------------
    // 2. CREAR EL PEDIDO DIGITAL
    // ------------------------------------------------------------------
    const { data: pedido, error: errPedido } = await supabase
      .from('pedidos')
      .insert([
        {
          cliente_id: clienteId,
          estado: 'pendiente',
          total_pedido: precio
        }
      ])
      .select()
      .single();

    if (errPedido) throw errPedido;

    // ------------------------------------------------------------------
    // 3. REGISTRAR LA VARIACIÓN / PLANTILLA VENDIDA
    // ------------------------------------------------------------------
    if (variacionSeleccionada?.id) {
      const { error: errItem } = await supabase
        .from('pedido_items')
        .insert([
          {
            pedido_id: pedido.id,
            variation_id: variacionSeleccionada.id,
            cantidad: 1,
            precio_unitario: precio
          }
        ]);

      if (errItem) throw errItem;
    }

    // ------------------------------------------------------------------
    // 4. REGISTRAR LA VENTA EN EL MÓDULO CONTABLE
    // ------------------------------------------------------------------
    const { error: errVenta } = await supabase
      .from('ventas')
      .insert([
        {
          cliente_id: clienteId,
          canal: 'web',
          total_venta: precio,
          estado: 'pendiente'
        }
      ]);

    if (errVenta) console.warn('Aviso en ventas:', errVenta.message);

    // ------------------------------------------------------------------
    // 5. REDIRIGIR A WHATSAPP
    // ------------------------------------------------------------------
    const numeroOrden = pedido.id.slice(0, 8).toUpperCase();
    const mensajeDigital = 
      `¡Hola Textiprint! 👋✨\n\n` +
      `Adquirí un recurso digital desde la web.\n\n` +
      `📦 *Orden:* #${numeroOrden}\n` +
      `💻 *Recurso Digital:* ${nombreProducto}\n` +
      `🎨 *Presentación:* ${presentacion}\n` +
      `💰 *Monto:* $${Number(precio).toFixed(2)} USD\n` +
      `📧 *Correo de Canva:* ${email}\n\n` +
      `Adjunto mi comprobante de pago para la activación.`;

    const urlWhatsApp = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeDigital)}`;
    window.open(urlWhatsApp, '_blank');
    setShowDigitalModal(false);

  } catch (error) {
    console.error('Error al guardar pedido digital:', error.message);
    alert('Ocurrió un detalle al guardar la orden, pero iniciaremos tu consulta por WhatsApp.');
    
    // De todos modos abrimos WhatsApp por respaldo
    const mensajeFallback = `¡Hola Textiprint! Quiero la plantilla: ${producto?.nombre} ($${variacionSeleccionada?.precio_venta} USD) para el correo: ${email}`;
    window.open(`https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeFallback)}`, '_blank');
  }
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