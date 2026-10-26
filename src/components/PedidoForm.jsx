import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';

export default function PedidoForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, clearCart, formatBs } = useCart();
  
  // Extraemos datos de fallback directo si vienen de la URL o state
  const stateProducto = location.state?.producto || null;
  const stateVariacion = location.state?.variacionSeleccionada || null;

  const [directProducto, setDirectProducto] = useState(stateProducto);
  const [directVariacion, setDirectVariacion] = useState(stateVariacion);
  const [fetchingData, setFetchingData] = useState(false);

  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [tasa, setTasa] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    ubicacion: ''
  });

  // Carga de tasa BCV y producto directo si no hay carrito
  useEffect(() => {
    async function inicializarPedido() {
      try {
        setFetchingData(true);

        // A. Cargar Tasa BCV
        const { data: configData } = await supabase
          .from('configuraciones')
          .select('valor')
          .eq('clave', 'tasa_bcv')
          .single();

        if (configData?.valor) {
          setTasa(parseFloat(configData.valor));
        }

        // B. Si hay carrito con items, no necesitamos cargar de la URL
        if (cart && cart.length > 0) {
          setFetchingData(false);
          return;
        }

        // C. Si ya tenemos producto y variación desde el state
        if (stateProducto && stateVariacion) {
          setDirectProducto(stateProducto);
          setDirectVariacion(stateVariacion);
          setFetchingData(false);
          return;
        }

        // D. Fallback por URL (?productoId=...&variationId=...)
        const params = new URLSearchParams(location.search);
        const pId = params.get('productoId');
        const vId = params.get('variationId');

        if (!pId) {
          setFetchingData(false);
          return;
        }

        const { data: prodData } = await supabase
          .from('productos')
          .select('*')
          .eq('id', pId)
          .single();

        const { data: varData } = await supabase
          .from('product_variations')
          .select('*')
          .eq('producto_id', pId);

        setDirectProducto(prodData || null);

        if (varData && varData.length > 0) {
          const matchedVar = varData.find((v) => v.id === vId) || varData[0];
          setDirectVariacion(matchedVar);
        }
      } catch (err) {
        console.error('Error al inicializar formulario de pedido:', err);
      } finally {
        setFetchingData(false);
      }
    }

    inicializarPedido();
  }, [location.search, stateProducto, stateVariacion, cart.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Determinar los items del pedido (bien sea del carrito o del producto directo)
  const isFromCart = cart && cart.length > 0;
  
  const orderItems = isFromCart
    ? cart
    : (directProducto && directVariacion)
      ? [
          {
            key: `${directProducto.id}-${directVariacion.id}`,
            productoId: directProducto.id,
            variationId: directVariacion.id,
            nombre: directProducto.nombre,
            presentacion: directVariacion.presentacion,
            precioUsd: Number(directVariacion.precio_venta) || 0,
            cantidad: 1,
            imagen: directProducto.imagen_url || ''
          }
        ]
      : [];

  // Cálculos de totales y verificación de productos digitales
  const hasDigitalItems = orderItems.some((item) => item.tipo === 'digital');
  const totalUsd = orderItems.reduce((acc, item) => acc + (item.precioUsd * item.cantidad), 0);
  const totalVES = totalUsd * tasa;
  const totalFormateadoBs = `Bs. ${totalVES.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert('No hay productos en el pedido.');
      return;
    }

    // 1. BLOQUEO INMEDIATO ANTI DOBLE CLIC (Ref sincrónico + estado)
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setLoading(true);

    try {
      let clienteId = null;
      const cleanTelefono = (formData.telefono || '').trim();
      const cleanCorreo = (formData.correo || '').trim().toLowerCase();
      const digitsTelefono = cleanTelefono.replace(/\D/g, '');

      // 2. REUTILIZAR CLIENTE EXISTENTE (Si correo o teléfono ya existen)
      let clienteExistente = null;

      // A. Buscar primero por correo si fue proporcionado
      if (cleanCorreo) {
        const { data: porCorreo, error: errCorreo } = await supabase
          .from('clientes')
          .select('id, nombre, apellido, telefono, correo, ubicacion')
          .ilike('correo', cleanCorreo)
          .limit(1);

        if (!errCorreo && porCorreo && porCorreo.length > 0) {
          clienteExistente = porCorreo[0];
        }
      }

      // B. Si no se encontró por correo y hay teléfono, buscar por teléfono
      if (!clienteExistente && cleanTelefono) {
        // Coincidencia exacta de teléfono
        const { data: porTel, error: errTel } = await supabase
          .from('clientes')
          .select('id, nombre, apellido, telefono, correo, ubicacion')
          .eq('telefono', cleanTelefono)
          .limit(1);

        if (!errTel && porTel && porTel.length > 0) {
          clienteExistente = porTel[0];
        } else if (digitsTelefono && digitsTelefono.length >= 7) {
          // Búsqueda flexible por los últimos 7 dígitos para ignorar guiones/formatos
          const { data: porLike } = await supabase
            .from('clientes')
            .select('id, nombre, apellido, telefono, correo, ubicacion')
            .ilike('telefono', `%${digitsTelefono.slice(-7)}%`)
            .limit(1);

          if (porLike && porLike.length > 0) {
            clienteExistente = porLike[0];
          }
        }
      }

      if (clienteExistente) {
        clienteId = clienteExistente.id;

        // Actualización silenciosa si el cliente no tenía correo o ubicación
        const updates = {};
        if (!clienteExistente.correo && cleanCorreo) updates.correo = cleanCorreo;
        if ((!clienteExistente.telefono || clienteExistente.telefono === '00000000000') && cleanTelefono) updates.telefono = cleanTelefono;
        if (formData.ubicacion && (!clienteExistente.ubicacion || clienteExistente.ubicacion === 'Caracas')) updates.ubicacion = formData.ubicacion;
        if (Object.keys(updates).length > 0) {
          supabase.from('clientes').update(updates).eq('id', clienteId).then(() => {});
        }
      } else {
        // Registrar nuevo cliente solo si no existe
        const { data: nuevoCliente, error: clienteError } = await supabase
          .from('clientes')
          .insert([
            {
              nombre: formData.nombre.trim(),
              apellido: formData.apellido.trim(),
              telefono: cleanTelefono,
              correo: cleanCorreo || null,
              origen: 'pagina_web',
              ubicacion: formData.ubicacion
            }
          ])
          .select()
          .single();

        if (clienteError) throw clienteError;
        clienteId = nuevoCliente.id;
      }

      // 3. FILTRO ANTI-DUPLICADO DE PEDIDO Y VENTA (Últimos 2 minutos con mismo cliente y mismo total)
      const dosMinutosAtras = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      let pedidoData = null;

      const { data: pedidosRecientes, error: errBusqPedido } = await supabase
        .from('pedidos')
        .select('id, total_pedido, registro')
        .eq('cliente_id', clienteId)
        .gte('registro', dosMinutosAtras)
        .order('registro', { ascending: false })
        .limit(1);

      const esDuplicado = !errBusqPedido && pedidosRecientes && pedidosRecientes.length > 0 &&
        Math.abs(Number(pedidosRecientes[0].total_pedido) - Number(totalUsd)) < 0.01;

      if (esDuplicado) {
        console.warn('Filtro anti-duplicado activo: Se detectó pedido idéntico en los últimos 2 minutos. Reutilizando orden:', pedidosRecientes[0].id);
        pedidoData = pedidosRecientes[0];
      } else {
        // REGISTRO EN 'pedidos'
        const { data: nuevoPedido, error: pedidoError } = await supabase
          .from('pedidos')
          .insert([
            {
              cliente_id: clienteId,
              estado: 'pendiente',
              total_pedido: totalUsd // En USD en base de datos
            }
          ])
          .select()
          .single();

        if (pedidoError) throw pedidoError;
        pedidoData = nuevoPedido;

        // REGISTRO EN 'pedido_items'
        const itemsToInsert = orderItems.map((item) => ({
          pedido_id: pedidoData.id,
          variation_id: item.variationId,
          cantidad: item.cantidad,
          precio_unitario: item.precioUsd
        }));

        const { error: itemError } = await supabase
          .from('pedido_items')
          .insert(itemsToInsert);

        if (itemError) console.warn('Aviso en pedido_items:', itemError.message);

        // REGISTRO EN 'ventas'
        const { error: ventaError } = await supabase
          .from('ventas')
          .insert([
            {
              cliente_id: clienteId,
              canal: 'tienda_online',
              total_venta: totalUsd,
              estado: 'pendiente'
            }
          ]);

        if (ventaError) console.warn('Aviso en ventas:', ventaError.message);
      }

      // 4. CÁLCULO Y CONSTRUCCIÓN DEL MENSAJE DE WHATSAPP (ESTRICTO BS.)
      const numeroOrden = pedidoData.id.slice(0, 8).toUpperCase();
      const telefonoWhatsApp = "584142467351";

      // Formatear lista de productos
      const lineasProductos = orderItems.map((item) => {
        const itemSubtotalBs = (item.precioUsd * item.cantidad * tasa).toLocaleString('es-VE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        return `• ${item.cantidad}x ${item.nombre} (${item.presentacion}) - Bs. ${itemSubtotalBs}`;
      }).join('\n');

      const emailLine = formData.correo ? `*Correo:* ${formData.correo}\n` : '';

      const mensajeText = 
        `¡Hola Textiprint! He realizado un pedido desde la web:\n\n` +
        `*Orden:* #${numeroOrden}\n` +
        `*Cliente:* ${formData.nombre} ${formData.apellido}\n` +
        `*Ubicación:* ${formData.ubicacion}\n` +
        emailLine +
        `\n*Productos:* \n${lineasProductos}\n\n` +
        `*Total a pagar:* ${totalFormateadoBs}\n\n` +
        `Quiero coordinar el pago para procesarlo.`;

      const urlWhatsapp = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeText)}`;
      
      // Vaciar carrito
      if (isFromCart) {
        clearCart();
      }

      window.open(urlWhatsapp, '_blank');
      navigate('/');

    } catch (error) {
      console.error("Error al procesar la transacción:", error.message);
      alert("Hubo un problema al procesar tu pedido. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  if (fetchingData) {
    return (
      <div className="checkout-container">
        <div className="checkout-card" style={{ maxWidth: '540px', margin: '40px auto', padding: '40px 30px', textAlign: 'center' }}>
          <div className="skeleton-box" style={{ width: '60%', height: '28px', margin: '0 auto 20px', borderRadius: '8px' }}></div>
          <div className="skeleton-box" style={{ width: '90%', height: '50px', margin: '0 auto 25px', borderRadius: '8px' }}></div>
          <p style={{ color: '#888', fontSize: '0.95rem' }}>Preparando los datos de tu orden...</p>
        </div>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-card" style={{ maxWidth: '520px', margin: '40px auto', textAlign: 'center', padding: '45px 25px' }}>
          <div style={{ fontSize: '3.2rem', marginBottom: '15px' }}>🛍️</div>
          <h2 style={{ color: 'var(--color-purple, #6f237e)', marginBottom: '10px' }}>No hay productos en tu pedido</h2>
          <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
            Tu carrito está vacío. Agrega tus fotos, llaveros o diseños favoritos para realizar tu pedido.
          </p>
          <button 
            onClick={() => navigate('/tienda-fisica')}
            className="btn-home-purple"
            style={{ padding: '12px 30px' }}
          >
            Explorar Catálogo ✨
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2 className="checkout-title">Finalizar Pedido</h2>

        {/* RESUMEN DE PRODUCTOS DEL PEDIDO (MÚLTIPLES O INDIVIDUAL) */}
        <div className="checkout-product-summary-box">
          <div className="checkout-summary-header">
            <span className="checkout-summary-title">Resumen de tu Orden</span>
            <span className="checkout-summary-badge">{orderItems.length} {orderItems.length === 1 ? 'producto' : 'productos'}</span>
          </div>

          <div className="checkout-summary-list">
            {orderItems.map((item, idx) => {
              const itemBs = (item.precioUsd * item.cantidad * tasa).toLocaleString('es-VE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              });
              return (
                <div key={idx} className="checkout-summary-item">
                  <div className="checkout-summary-item-left">
                    <span className="checkout-summary-item-qty">{item.cantidad}x</span>
                    <div className="checkout-summary-item-text">
                      <span className="checkout-summary-item-name">{item.nombre}</span>
                      <span className="checkout-summary-item-variant">{item.presentacion}</span>
                    </div>
                  </div>
                  <span className="checkout-summary-item-price">Bs. {itemBs}</span>
                </div>
              );
            })}
          </div>

          <div className="checkout-summary-total-row">
            <span className="checkout-total-label">Total a pagar:</span>
            <span className="checkout-total-value">{totalFormateadoBs}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-form-row">
            <div className="form-group">
              <label className="checkout-label">Nombre</label>
              <input 
                type="text" 
                name="nombre" 
                required 
                placeholder="Ej: María" 
                value={formData.nombre}
                onChange={handleChange}
                className="checkout-input" 
              />
            </div>
            <div className="form-group">
              <label className="checkout-label">Apellido</label>
              <input 
                type="text" 
                name="apellido" 
                required 
                placeholder="Ej: Pérez" 
                value={formData.apellido}
                onChange={handleChange}
                className="checkout-input" 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkout-label">Número de Teléfono</label>
            <input 
              type="tel" 
              name="telefono" 
              required 
              placeholder="Ej: 04141234567" 
              value={formData.telefono}
              onChange={handleChange}
              className="checkout-input" 
            />
          </div>

          <div className="form-group">
            <label className="checkout-label">
              Correo Electrónico {hasDigitalItems ? <span style={{ color: 'var(--color-vivid-pink)', fontWeight: 'bold' }}>(Requerido para activar tus plantillas Canva)</span> : '(Opcional)'}
            </label>
            <input 
              type="email" 
              name="correo" 
              required={hasDigitalItems}
              placeholder="ejemplo@correo.com" 
              value={formData.correo}
              onChange={handleChange}
              className="checkout-input" 
            />
          </div>

          <div className="form-group">
            <label htmlFor="checkout-ubicacion" className="checkout-label">Ubicación / Dirección de Envío</label>
            <select 
              id="checkout-ubicacion"
              aria-label="Ubicación o dirección de entrega"
              name="ubicacion" 
              required 
              value={formData.ubicacion}
              onChange={handleChange}
              className="checkout-input checkout-select"
            >
              <option value="">Selecciona tu ubicación...</option>
              <option value="Los Teques">Los Teques</option>
              <option value="Carrizal">Carrizal</option>
              <option value="San Antonio">San Antonio</option>
              <option value="Caracas">Caracas</option>
              <option value="Envío Nacional">Envío Nacional</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-checkout-submit"
          >
            {loading ? "Procesando pedido..." : "Confirmar y Enviar a WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}