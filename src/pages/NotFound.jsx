import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-wrapper" style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at center, #fff 0%, #fff7fb 100%)'
    }}>
      <div style={{
        maxWidth: '620px',
        width: '100%',
        textAlign: 'center',
        background: '#ffffff',
        padding: '50px 30px',
        borderRadius: '28px',
        boxShadow: '0 20px 45px rgba(111, 35, 126, 0.07)',
        border: '2px dashed #f3d2e3',
        position: 'relative'
      }}>
        {/* Decoraciones de tijeras y destellos */}
        <div style={{ fontSize: '3.8rem', marginBottom: '10px', filter: 'drop-shadow(0 4px 10px rgba(221,10,104,0.2))' }}>
          ✂️🎨✨
        </div>

        <span style={{
          display: 'inline-block',
          backgroundColor: '#fce7f3',
          color: 'var(--color-vivid-pink, #dd0a68)',
          fontWeight: '700',
          fontSize: '0.85rem',
          padding: '6px 16px',
          borderRadius: '50px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          marginBottom: '15px'
        }}>
          Error 404 • Página Extraviada
        </span>

        <h1 style={{
          color: 'var(--color-purple, #6f237e)',
          fontSize: '2.3rem',
          fontWeight: '800',
          marginBottom: '15px',
          lineHeight: '1.2'
        }}>
          ¡Ups! Este diseño no está en nuestro catálogo
        </h1>

        <p style={{
          color: '#555',
          fontSize: '1.05rem',
          lineHeight: '1.6',
          maxWidth: '480px',
          margin: '0 auto 30px'
        }}>
          Parece que la página que buscas fue recortada, cambió de enlace o aún la estamos diseñando con mucho cariño.
        </p>

        {/* Botones de navegación directa */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '35px'
        }}>
          <button
            onClick={() => navigate('/')}
            className="btn-home-purple"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            🏠 Ir al Inicio
          </button>
          <button
            onClick={() => navigate('/tienda-fisica')}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-purple, #6f237e)',
              border: '2px solid var(--color-purple, #6f237e)',
              padding: '12px 24px',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            ✂️ Papelería Física
          </button>
          <button
            onClick={() => navigate('/plantillas-digitales')}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-vivid-pink, #dd0a68)',
              border: '2px solid var(--color-vivid-pink, #dd0a68)',
              padding: '12px 24px',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            🎨 Plantillas Canva
          </button>
        </div>

        {/* Pequeña ayuda al cliente */}
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid #f1e6ec',
          fontSize: '0.9rem',
          color: '#777'
        }}>
          ¿Buscabas algo específico?{' '}
          <a
            href="https://wa.me/584142467351?text=¡Hola!%20No%20encontré%20lo%20que%20buscaba%20en%20la%20página%20y%20quisiera%20consultar."
            target="_blank"
            rel="noreferrer"
            style={{ color: '#25D366', fontWeight: 'bold', textDecoration: 'none' }}
          >
            Pregúntanos por WhatsApp 👋
          </a>
        </div>
      </div>
    </div>
  );
}
