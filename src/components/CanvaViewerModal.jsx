// src/components/CanvaViewerModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getCanvaEmbedUrl } from '../utils/canvaUtils';

export default function CanvaViewerModal({ 
  isOpen, 
  onClose, 
  canvaUrl, 
  titulo = 'Diseños y Modelos' 
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);
  const embedUrl = getCanvaEmbedUrl(canvaUrl);

  // Bloqueo de scroll en body al abrir el visor
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLoading(true);
    } else {
      document.body.style.overflow = '';
      setIsFullscreen(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar con la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  // Manejo de pantalla completa (CSS + API nativa)
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (modalRef.current?.requestFullscreen) {
        modalRef.current.requestFullscreen().catch(() => {
          // Si el navegador bloquea la API nativa, el estado CSS isFullscreen cubre 100vw/100vh
        });
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  if (!isOpen || !embedUrl) return null;

  return (
    <div 
      className={`canva-modal-backdrop ${isFullscreen ? 'is-fullscreen' : ''}`}
      onClick={(e) => {
        // Cerrar si hace clic fuera del contenedor principal
        if (e.target === e.currentTarget && !isFullscreen) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div 
        ref={modalRef}
        className={`canva-modal-container ${isFullscreen ? 'fullscreen-mode' : ''}`}
      >
        {/* Barra superior del visor */}
        <div className="canva-modal-header">
          <div className="canva-modal-header-info">
            <span className="canva-header-badge">🎄 Catálogo Textiprint</span>
            <h3 className="canva-header-title">{titulo}</h3>
          </div>

          <div className="canva-modal-actions">
            <button 
              type="button"
              onClick={toggleFullscreen}
              className="canva-btn-fullscreen"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
            >
              {isFullscreen ? '⤢ Reducir' : '⛶ Pantalla Completa'}
            </button>

            <button 
              type="button"
              onClick={onClose}
              className="canva-btn-close"
              title="Cerrar catálogo"
              aria-label="Cerrar catálogo"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* Notificación guía para celulares */}
        <div className="canva-modal-banner-tip">
          <span>✨ <strong>Explora los modelos:</strong> Toca o desliza sobre el catálogo para pasar de página. ¡Todos los pedidos se gestionan aquí en la web!</span>
        </div>

        {/* Contenedor del Iframe Canva */}
        <div className="canva-iframe-wrapper">
          {loading && (
            <div className="canva-loading-spinner-box">
              <div className="canva-spinner"></div>
              <p>Cargando diseños...</p>
            </div>
          )}

          <iframe
            src={embedUrl}
            title={titulo}
            className="canva-iframe"
            allow="fullscreen"
            allowFullScreen
            loading="lazy"
            onLoad={() => setLoading(false)}
          />
        </div>

        {/* Barra inferior de soporte */}
        <div className="canva-modal-footer">
          <span className="canva-footer-text">
            ¿Viste un modelo que te gusta? Cierra el visor y elígelo en la lista para agregarlo a tu pedido en <strong>Bolívares (Bs.)</strong>.
          </span>
          <button 
            type="button" 
            onClick={onClose}
            className="canva-btn-footer-close"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    </div>
  );
}

