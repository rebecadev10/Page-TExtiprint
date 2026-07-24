import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function PedidoForm() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extraemos los datos que vienen desde ProductDetail
  const { producto, variacionSeleccionada } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    ubicacion: ''
  });

  // Redirección de seguridad si no hay datos en el estado
  useEffect(() => {
    if (!producto || !variacionSeleccionada) {
      navigate('/');
    }
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

      // ------------------------------------------------------------------
      // PASO 1: VALIDACIÓN DE DUPLICADOS (Por Teléfono)
      // ------------------------------------------------------------------
      const { data: clientesEncontrados, error: searchError } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefono', formData.telefono)
        .limit(1);

      if (searchError) throw searchError;

      if (clientesEncontrados && clientesEncontrados.length > 0) {
        // El cliente ya existe, reciclamos su ID para no duplicarlo
        clienteId = clientesEncontrados[0].id;
      } else {
        // Es un cliente nuevo, lo registramos de cero
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

      // ------------------------------------------------------------------
      // PASO 2: REGISTRAR EN LA TABLA 'pedidos'
      // ------------------------------------------------------------------
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([
          {
            cliente_id: clienteId,
            estado: 'pendiente',
            total_pedido: variacionSeleccionada.precio_venta
          }
        ])
        .select()
        .single(); // Clave para heredar el ID del pedido generado hacia sus ítems

      if (pedidoError) throw pedidoError;

      // ------------------------------------------------------------------
      // PASO 3: REGISTRAR EN LA TABLA 'pedido_items' (¡El que nos faltaba!)
      // ------------------------------------------------------------------
      const { error: itemError } = await supabase
        .from('pedido_items')
        .insert([
          {
            pedido_id: pedidoData.id,               // Enlace relacional con el pedido maestro
            variation_id: variacionSeleccionada.id, // Relación con product_variations
            cantidad: 1,                            // Cantidad base inicial
            precio_unitario: variacionSeleccionada.precio_venta
          }
        ]);

      if (itemError) throw itemError;

      // ------------------------------------------------------------------
      // PASO 4: REGISTRAR EN LA TABLA CONTABLE 'ventas'
      // ------------------------------------------------------------------
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert([
          {
            cliente_id: clienteId,
            canal: 'tienda_online',
            total_venta: variacionSeleccionada.precio_venta,
            estado: 'pendiente'
          }
        ])
        .select()
        .single();

      if (ventaError) throw ventaError;

      // ------------------------------------------------------------------
      // PASO 5: REDIRECCIÓN FORMATEADA A WHATSAPP
      // ------------------------------------------------------------------
      // Usamos el ID abreviado del pedido para darle consistencia a la orden
      const numeroOrden = pedidoData.id.slice(0, 8).toUpperCase();
      const telefonoWhatsApp = "584142467351"; 
      
      const mensajeText = 
        `¡Hola Textiprint! 👋✨\n\n` +
        `He registrado mi solicitud desde la web.\n\n` +
        `📦 *Orden:* #${numeroOrden}\n` +
        `👤 *Cliente:* ${formData.nombre} ${formData.apellido}\n` +
        `📞 *Teléfono:* ${formData.telefono}\n` +
        `📍 *Ubicación:* ${formData.ubicacion}\n\n` +
        `🛒 *Producto:* ${producto.nombre}\n` +
        `📐 *Presentación:* ${variacionSeleccionada.presentacion}\n` +
        `💰 *Total:* $${Number(variacionSeleccionada.precio_venta).toFixed(2)} USD\n\n` +
        `Me gustaría coordinar los detalles del pago para procesar mi pedido.`;

      const urlWhatsapp = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeText)}`;
      
      window.open(urlWhatsapp, '_blank');
      navigate('/');

    } catch (error) {
      console.error("Error al procesar la transacción completa:", error.message);
      alert("Hubo un problema al procesar tu pedido en la base de datos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!producto || !variacionSeleccionada) return null;

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2 className="checkout-title">Finalizar Pedido</h2>
        
        <div className="checkout-product-summary">
          Estás encargando: <span>{producto.nombre} ({variacionSeleccionada.presentacion})</span> por <span>${Number(variacionSeleccionada.precio_venta).toFixed(2)} USD</span>
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