import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function PedidoForm() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Extraemos los datos que vienen desde state o inicializamos para fallback por URL
  const stateProducto = location.state?.producto || null;
  const stateVariacion = location.state?.variacionSeleccionada || null;

  const [producto, setProducto] = useState(stateProducto);
  const [variacionSeleccionada, setVariacionSeleccionada] = useState(stateVariacion);
  const [fetchingData, setFetchingData] = useState(!stateProducto || !stateVariacion);

  const [loading, setLoading] = useState(false);
  const [tasa, setTasa] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    ubicacion: ''
  });

  // Carga de producto (si recargan la página o entran por URL) y tasa BCV
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

        // B. Si ya tenemos producto y variación desde el state, no requerimos consultar
        if (stateProducto && stateVariacion) {
          setProducto(stateProducto);
          setVariacionSeleccionada(stateVariacion);
          setFetchingData(false);
          return;
        }

        // C. Fallback: buscar por query params en la URL (?productoId=...&variationId=...)
        const params = new URLSearchParams(location.search);
        const pId = params.get('productoId');
        const vId = params.get('variationId');

        if (!pId) {
          setFetchingData(false);
          return;
        }

        // Consultamos el producto
        const { data: prodData, error: prodErr } = await supabase
          .from('productos')
          .select('*')
          .eq('id', pId)
          .single();

        if (prodErr || !prodData) {
          setFetchingData(false);
          return;
        }

        // Consultamos las variaciones
        const { data: varData } = await supabase
          .from('product_variations')
          .select('*')
          .eq('producto_id', pId);

        setProducto(prodData);

        if (varData && varData.length > 0) {
          const matchedVar = varData.find(v => v.id === vId) || varData[0];
          setVariacionSeleccionada(matchedVar);
        }

      } catch (err) {
        console.error('Error al inicializar formulario de pedido:', err);
      } finally {
        setFetchingData(false);
      }
    }

    inicializarPedido();
  }, [location.search, stateProducto, stateVariacion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let clienteId = null;

      // 1. VALIDACIÓN / REGISTRO DE CLIENTE
      const { data: clientesEncontrados, error: searchError } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefono', formData.telefono)
        .limit(1);

      if (searchError) throw searchError;

      if (clientesEncontrados && clientesEncontrados.length > 0) {
        clienteId = clientesEncontrados[0].id;
      } else {
        const { data: nuevoCliente, error: clienteError } = await supabase
          .from('clientes')
          .insert([
            {
              nombre: formData.nombre,
              apellido: formData.apellido,
              telefono: formData.telefono,
              correo: formData.correo || null,
              origen: 'pagina_web',
              ubicacion: formData.ubicacion
            }
          ])
          .select()
          .single();

        if (clienteError) throw clienteError;
        clienteId = nuevoCliente.id;
      }

      // 2. REGISTRO EN 'pedidos'
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([
          {
            cliente_id: clienteId,
            estado: 'pendiente',
            total_pedido: variacionSeleccionada.precio_venta // Se mantiene en USD en la BD
          }
        ])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // 3. REGISTRO EN 'pedido_items'
      const { error: itemError } = await supabase
        .from('pedido_items')
        .insert([
          {
            pedido_id: pedidoData.id,
            variation_id: variacionSeleccionada.id,
            cantidad: 1,
            precio_unitario: variacionSeleccionada.precio_venta
          }
        ]);

      if (itemError) throw itemError;

      // 4. REGISTRO EN 'ventas'
      const { error: ventaError } = await supabase
        .from('ventas')
        .insert([
          {
            cliente_id: clienteId,
            canal: 'tienda_online',
            total_venta: variacionSeleccionada.precio_venta,
            estado: 'pendiente'
          }
        ]);

      if (ventaError) throw ventaError;

      // 5. CÁLCULO Y CONSTRUCCIÓN DEL MENSAJE DE WHATSAPP (CORTO Y EN BS.)
      const numeroOrden = pedidoData.id.slice(0, 8).toUpperCase();
      const telefonoWhatsApp = "584142467351"; 
      
      const precioUSD = Number(variacionSeleccionada.precio_venta) || 0;
      const totalVES = precioUSD * tasa;
      const totalFormateadoBs = `Bs. ${totalVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      const mensajeText = 
        `¡Hola Textiprint! He realizado un pedido desde la web:\n\n` +
        `*Orden:* #${numeroOrden}\n` +
        `*Cliente:* ${formData.nombre} ${formData.apellido}\n` +
        `*Ubicación:* ${formData.ubicacion}\n` +
        `*Producto:* ${producto.nombre} (${variacionSeleccionada.presentacion})\n` +
        `*Total a pagar:* ${totalFormateadoBs}\n\n` +
        `Quiero coordinar el pago para procesarlo.`;

      const urlWhatsapp = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeText)}`;
      
      window.open(urlWhatsapp, '_blank');
      navigate('/');

    } catch (error) {
      console.error("Error al procesar la transacción:", error.message);
      alert("Hubo un problema al procesar tu pedido. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="checkout-container">
        <div className="checkout-card" style={{ maxWidth: '520px', margin: '40px auto', padding: '40px 30px', textAlign: 'center' }}>
          <div className="skeleton-box" style={{ width: '60%', height: '28px', margin: '0 auto 20px', borderRadius: '8px' }}></div>
          <div className="skeleton-box" style={{ width: '90%', height: '50px', margin: '0 auto 25px', borderRadius: '8px' }}></div>
          <p style={{ color: '#888', fontSize: '0.95rem' }}>Preparando los datos de tu orden...</p>
        </div>
      </div>
    );
  }

  if (!producto || !variacionSeleccionada) {
    return (
      <div className="checkout-container">
        <div className="checkout-card" style={{ maxWidth: '520px', margin: '40px auto', textAlign: 'center', padding: '45px 25px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🛍️</div>
          <h2 style={{ color: 'var(--color-purple, #6f237e)', marginBottom: '10px' }}>No hay un producto seleccionado</h2>
          <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
            Para realizar un pedido, primero elige tu producto favorito en nuestro catálogo.
          </p>
          <button 
            onClick={() => navigate('/tienda-fisica')}
            className="btn-home-purple"
            style={{ padding: '12px 30px' }}
          >
            Explorar Papelería ✨
          </button>
        </div>
      </div>
    );
  }

  const precioUSD = Number(variacionSeleccionada.precio_venta) || 0;
  const precioVES = precioUSD * tasa;
  const precioFormateadoBs = `Bs. ${precioVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2 className="checkout-title">Finalizar Pedido</h2>
        
        <div className="checkout-product-summary">
          Estás encargando: <span>{producto.nombre} ({variacionSeleccionada.presentacion})</span> por <span>{precioFormateadoBs}</span>
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
            <label className="checkout-label">Correo Electrónico (Opcional)</label>
            <input 
              type="email" 
              name="correo" 
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
            {loading ? "Procesando orden..." : "Confirmar y Enviar a WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}