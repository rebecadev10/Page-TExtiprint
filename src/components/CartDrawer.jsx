import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    formatBs,
    totalBsFormatted
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/pedido');
  };

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <aside 
        className="cart-drawer-panel" 
        onClick={(e) => e.stopPropagation()} 
        aria-label="Carrito de compras"
      >
        {/* ENCABEZADO */}
        <div className="cart-drawer-header">
          <div className="cart-header-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h2>Tu Carrito</h2>
            <span className="cart-header-badge">
              {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
            </span>
          </div>
          <button 
            type="button" 
            className="cart-close-btn" 
            onClick={closeCart} 
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        {/* LISTA DE ITEMS */}
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">🛍️</div>
              <h3>Tu carrito está vacío</h3>
              <p>Agrega fotos, llaveros o tus productos favoritos para armar tu pedido.</p>
              <button 
                type="button" 
                className="cart-empty-btn" 
                onClick={closeCart}
              >
                Explorar catálogo
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => {
                const subtotalBs = formatBs(item.precioUsd * item.cantidad);
                return (
                  <div key={item.key} className="cart-item-card">
                    {/* Miniatura */}
                    <div className="cart-item-img-box">
                      {item.imagen ? (
                        <img src={item.imagen} alt={item.nombre} />
                      ) : (
                        <div className="cart-item-placeholder">🖼️</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="cart-item-info">
                      <div className="cart-item-header">
                        <h4 className="cart-item-name">{item.nombre}</h4>
                        <button
                          type="button"
                          className="cart-item-remove-btn"
                          onClick={() => removeFromCart(item.key)}
                          aria-label={`Eliminar ${item.nombre}`}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>

                      <span className="cart-item-variant">{item.presentacion}</span>

                      <div className="cart-item-footer">
                        {/* Control de cantidad */}
                        <div className="cart-qty-stepper">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.key, item.cantidad - 1)}
                            aria-label="Disminuir cantidad"
                          >
                            −
                          </button>
                          <span className="qty-value">{item.cantidad}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.key, item.cantidad + 1)}
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal en Bs. */}
                        <span className="cart-item-price">{subtotalBs}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER TOTAL Y BOTÓN DE CHECKOUT */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-box">
              <div className="cart-total-row">
                <span className="cart-total-label">Total a pagar:</span>
                <span className="cart-total-value">{totalBsFormatted}</span>
              </div>
              <span className="cart-bcv-note">Tasa oficial BCV</span>
            </div>

            <button 
              type="button" 
              className="cart-checkout-btn" 
              onClick={handleCheckout}
            >
              Finalizar Pedido →
            </button>

            <button 
              type="button" 
              className="cart-continue-btn" 
              onClick={closeCart}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
