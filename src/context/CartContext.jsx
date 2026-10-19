import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CartContext = createContext();

const CART_STORAGE_KEY = 'textiprint_cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error al leer el carrito de localStorage:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tasaBcv, setTasaBcv] = useState(1);

  // Guardar en localStorage cada vez que cambie el carrito
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error al guardar el carrito en localStorage:', e);
    }
  }, [cart]);

  // Cargar tasa BCV para cálculos
  useEffect(() => {
    async function fetchTasa() {
      try {
        const { data } = await supabase
          .from('configuraciones')
          .select('valor')
          .eq('clave', 'tasa_bcv')
          .single();

        if (data?.valor) {
          setTasaBcv(parseFloat(data.valor));
        }
      } catch (err) {
        console.warn('No se pudo cargar la tasa BCV para el carrito:', err);
      }
    }
    fetchTasa();
  }, []);

  // Agregar producto y variante al carrito
  const addToCart = (producto, variacion, cantidad = 1) => {
    if (!producto || !variacion) return;

    setCart((prevCart) => {
      const itemKey = `${producto.id}-${variacion.id}`;
      const existingIndex = prevCart.findIndex((item) => item.key === itemKey);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: updated[existingIndex].cantidad + cantidad
        };
        return updated;
      }

      const newItem = {
        key: itemKey,
        productoId: producto.id,
        variationId: variacion.id,
        nombre: producto.nombre,
        presentacion: variacion.presentacion,
        precioUsd: Number(variacion.precio_venta) || 0,
        imagen: producto.imagen_url || '',
        tipo: producto.tipo || 'fisico',
        cantidad
      };

      return [...prevCart, newItem];
    });

    setIsCartOpen(true);
  };

  // Quitar un item del carrito
  const removeFromCart = (itemKey) => {
    setCart((prevCart) => prevCart.filter((item) => item.key !== itemKey));
  };

  // Actualizar cantidad
  const updateQuantity = (itemKey, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.key === itemKey ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  // Vaciar carrito
  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Cantidad total de items
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  // Total acumulado en USD (para base de datos)
  const totalUsd = cart.reduce((acc, item) => acc + item.precioUsd * item.cantidad, 0);

  // Total formateado en Bolívares (para mostrar al cliente - ¡Estricto Bs.!)
  const formatBs = (montoUsd) => {
    const ves = Number(montoUsd) * tasaBcv;
    return `Bs. ${ves.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const totalBsFormatted = formatBs(totalUsd);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        totalItems,
        totalUsd,
        tasaBcv,
        formatBs,
        totalBsFormatted
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
