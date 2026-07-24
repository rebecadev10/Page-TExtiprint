import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="about-container" style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'inherit' }}>
      
      {/* SECCIÓN 1: EL CORAZÓN DE TEXTIPRINT */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span className="product-tag" style={{ color: 'var(--color-vivid-pink)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.9rem' }}>
          Un pedacito de nuestra alma ✨
        </span>
        <h1 style={{ color: 'var(--color-purple)', fontSize: '2.8rem', marginTop: '10px', fontWeight: '800' }}>
          La Historia Detrás de Cada Detalle
        </h1>
        <p style={{ color: '#475569', fontSize: '1.15rem', maxWidth: '750px', margin: '20px auto 0', lineHeight: '1.8', fontStyle: 'italic' }}>
          "Soy fiel creyente de que las cosas se hacen con amor, o simplemente no se hacen. Cuando diseñas algo pensando en el cariño de la persona que lo va a recibir, la magia ocurre sola."
        </p>
      </div>

      {/* SECCIÓN 2: DE UN LLAVERO A UN SUEÑO DIGITAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', marginBottom: '60px' }}>
        <div style={{ lineHeight: '1.8', color: '#334155', fontSize: '1.05rem' }}>
          <h2 style={{ color: 'var(--color-vivid-magenta)', fontSize: '1.8rem', marginBottom: '20px', fontWeight: '700' }}>
            Nuestros comienzos
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Textiprint comenzó con una idea muy simple: vender llaveros en mi comunidad. Cuando arranqué, <strong>ni siquiera tenía una impresora propia</strong>, pero tenía unas ganas inmensas de crear. Poco a poco, gracias a la confianza de cada cliente que creyó en mí, logramos cosas grandiosas.
          </p>
          <p>
            El verdadero clic ocurrió cuando un cliente me pidió un diseño especial. En lugar de comprar una plantilla hecha, decidí sentarme a diseñarla yo misma de cero—así nació nuestra famosa plantilla <em>Flips</em>. Descubrí que me apasionaba el mundo de la personalización; esa sensación de crear algo en digital y luego verlo materializado en físico es simplemente fabulosa.
          </p>
        </div>

        {/* Bloque Destacado: El Súper Poder */}
        <div style={{ background: 'linear-gradient(135deg, #fae8ff 0%, #fdf2f8 100%)', padding: '45px 35px', borderRadius: '24px', border: '2px dashed var(--color-vivid-pink)', position: 'relative' }}>
          <span style={{ fontSize: '3rem', position: 'absolute', top: '-25px', left: '30px' }}>💝</span>
          <h3 style={{ color: 'var(--color-purple)', fontSize: '1.4rem', marginBottom: '15px', fontWeight: '700', marginTop: '10px' }}>
            Hecho con Amor Real
          </h3>
          <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1rem' }}>
            Nuestro mayor diferencial no es un algoritmo ni una máquina; es el amor y la dedicación con la que estructuramos cada recurso. Pensamos meticulosamente en la experiencia de quien lo va a usar para asegurar que su resultado final sea impecable.
          </p>
        </div>
      </div>

      <hr style={{ border: '0', height: '1px', background: 'linear-gradient(to right, transparent, #e2e8f0, transparent)', margin: '50px 0' }} />

      {/* SECCIÓN 3: HACIA DÓNDE VAMOS (CRECER JUNTAS) */}
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.8rem', textAlign: 'center', marginBottom: '15px', fontWeight: '700' }}>
          Diseñando el Futuro del Crafting
        </h2>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          Hoy nos enfocamos con fuerza en los <strong>productos y plantillas digitales</strong>. Queremos derribar los límites de la distancia geográfica para ofrecerte herramientas inmediatas y una atención excepcional.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
          {/* Card 1: Comunidad Crafter */}
          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
            <div style={{ background: '#f3e8ff', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.3rem' }}>✂️</span>
            </div>
            <h4 style={{ color: '#1e293b', fontSize: '1.15rem', marginBottom: '10px', fontWeight: '700' }}>Para Crafters y Emprendedoras</h4>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Queremos que otras mentes creativas adquieran nuestras plantillas listas para usar, simplifiquen sus flujos de trabajo y encuentren en Textiprint un aliado real para hacer crecer sus propios negocios.
            </p>
          </div>

          {/* Card 2: El Feedback Humano */}
          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
            <div style={{ background: '#fce7f3', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.3rem' }}>🗣️</span>
            </div>
            <h4 style={{ color: '#1e293b', fontSize: '1.15rem', marginBottom: '10px', fontWeight: '700' }}>Conexión Humana</h4>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Nos fascina el intercambio de ideas. Cada cliente nos enseña algo nuevo: desde quienes nos recomiendan con cariño hasta los retos complejos; valoramos ver sus reacciones al recibir un pedido porque es tierno y nos ayuda a mejorar.
            </p>
          </div>

          {/* Card 3: Visión de Gran Escala */}
          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
            <div style={{ background: '#e0f2fe', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.3rem' }}>🌍</span>
            </div>
            <h4 style={{ color: '#1e293b', fontSize: '1.15rem', marginBottom: '10px', fontWeight: '700' }}>Próxima Meta</h4>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
              No nos detenemos. Nuestro sueño a mediano plazo es importar insumos y productos a gran escala para proveer directamente a esos nuevos emprendedores que están iniciando su camino creativo.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: ACCIÓN */}
      <div style={{ background: 'var(--color-purple)', borderRadius: '24px', padding: '45px 30px', textAlign: 'center', color: '#fff', boxShadow: '0 10px 30px rgba(107, 33, 168, 0.15)' }}>
        <h3 style={{ fontSize: '1.7rem', marginBottom: '12px', fontWeight: '700', color: '#fff' }}>¡Gracias por formar parte de este camino!</h3>
        <p style={{ color: '#f3e8ff', maxWidth: '550px', margin: '0 auto 25px', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Te invito a explorar nuestras plantillas y recursos digitales. Estamos aquí para ayudarte a crear con total libertad y mucho amor.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="btn-action-main"
          style={{ backgroundColor: '#fff', color: 'var(--color-purple)', fontWeight: 'bold', width: 'auto', padding: '12px 35px', margin: '0 auto', border: 'none', borderRadius: '50px', cursor: 'pointer' }}
        >
          Explorar la Tienda ✨
        </button>
      </div>

    </div>
  );
}