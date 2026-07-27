import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function PedidoForm() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extraemos los datos que vienen desde ProductDetail
  const { producto, variacionSeleccionada } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [tasa, setTasa] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    ubicacion: ''
  });

  // Redirección de seguridad y carga de tasa BCV
  useEffect(() => {
    if (!producto || !variacionSeleccionada) {
      navigate('/');
      return;
    }

    async function obtenerTasa() {
      try {
        const { data, error } = await supabase
          .from('configuraciones')
          .select('valor')
          .eq('clave', 'tasa_bcv')
          .single();

        if (!error && data) {
          setTasa(parseFloat(data.valor));
        }
      } catch (err) {
        console.error('Error al cargar la tasa BCV:', err.message);
      }
    }

    obtenerTasa();
  }, [producto, variacionSeleccionada, navigate]);

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

  if (!producto || !variacionSeleccionada) return null;

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
            <label className="checkout-label">Ubicación / Dirección de Envío</label>
            <select 
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