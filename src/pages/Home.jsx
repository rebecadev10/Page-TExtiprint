import React from 'react';
import ProductsList from '../components/Products';

export default function Home() {
  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

 const services = [
  { 
    title: 'Planners & Agendas Personalizadas', 
    desc: 'Organizadores físicos diseñados exclusivamente para estructurar tus metas cotidianas, combinando funcionalidad impecable con acabados de alta calidad.', 
    className: 'bg-pastel-purple' 
  },
  { 
    title: 'Plantillas de Canva Editables', 
    desc: 'Recursos e identidades digitales listas para transformar tus redes sociales o proyectos comerciales de manera inmediata, profesional y sin complicaciones.', 
    className: 'bg-pastel-yellow' 
  },
  { 
    title: 'Kits de Etiquetas Escolares', 
    desc: 'Identificadores creativos de alta resistencia diseñados para organizar todos los útiles de los más pequeños con diseños únicos y duraderos.', 
    className: 'bg-pastel-pink' 
  },
  { 
    title: 'Papelería e Identidad Corporativa', 
    desc: 'Tarjetas de presentación, empaques y complementos impresos detalladamente para elevar la presencia de tu marca y cautivar a tus clientes desde el primer contacto.', 
    className: 'bg-pastel-cyan' 
  },
];

  return (
    <div className="home-wrapper">
      
      {/* 1. SECCIÓN HERO OPTIMIZADA CON CRITERIOS UX */}
      <section className="home-hero-section">
        <span className="hero-deco-sparkle sparkle-1">✨</span>
        <span className="hero-deco-sparkle sparkle-2">💖</span>
        <span className="hero-deco-sparkle sparkle-3">✨</span>

        <div className="hero-container">
          
          {/* COLUMNA IZQUIERDA: MENSAJE CON JERARQUÍA CLARA */}
          <div className="hero-text-side">
            <h1 className="home-hero-title">
              Haz realidad tus ideas <br />
              <span>con papelería creativa</span>
            </h1>
            
            <p className="home-hero-desc">
              Creamos recursos digitales y piezas físicas pensadas para inspirar puro orden y alegría en tus días.
            </p>
            
            {/* CTA Único enfocado en conversión */}
            <div className="home-hero-buttons">
              <button 
                onClick={() => handleScrollToSection('catalogo-vivo')} 
                className="btn-hero-primary"
              >
                Explorar Catálogo ✨
              </button>
            </div>

            {/* Mensaje clave/Etiqueta reposicionado estratégicamente abajo */}
            <span className="home-hero-tagline">
              ✂️ Diseño &amp; Papelería Exclusiva
            </span>
          </div>

          {/* COLUMNA DERECHA: IMAGEN PROTAGONISTA AMPLIFICADA */}
          <div className="hero-image-side">
            <div className="hero-mockup-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop" 
                alt="Colección Exclusiva Textiprint Showcase" 
                className="hero-showcase-img"
                onError={(e) => {
                  e.target.src = "https://placehold.co/540x400/fdf2f8/db2777?text=Textiprint+Creative+✨";
                }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* 2. SECCIÓN NUESTROS SERVICIOS */}
     <section className="home-services-section">
  <span className="home-section-subtitle-purple">¿Qué hacemos?</span>
  <h2 className="home-section-title">Servicios &amp; Categorías</h2>
  
  <div className="home-services-grid">
    {services.map((service, index) => (
      <div 
        key={index} 
        className={`service-card ${service.className}`}
      >
        <h3 className="service-card-title">{service.title}</h3>
        <p className="service-card-desc">{service.desc}</p>
      </div>
    ))}
  </div>
</section>

      {/* 3. CATÁLOGO REAL ASOCIADO A SUPABASE */}
      <section className="home-featured-section" id="catalogo-vivo">
        <span className="home-section-subtitle-pink">Selección especial</span>
        <ProductsList />
      </section>

      {/* 4. BANNER INFERIOR DE CONVERSIÓN */}
      <section className="home-cta-section">
        <div className="cta-box-dark">
          <div className="cta-text-side">
            <h3 className="cta-title-yellow">¿Tienes dudas sobre los métodos de pago?</h3>
            <p className="cta-desc-white">
              Atendemos de forma personalizada en Venezuela. Aceptamos transferencias bancarias, Pago Móvil y opciones digitales. ¡Escríbenos y coordinamos tu pedido en minutos!
            </p>
          </div>
          <div>
            <a 
              href="https://wa.me/584142467351?text=¡Hola!%20Quiero%20consultar%20sobre%20los%20métodos%20de%20pago%20y%20coordinar%20mi%20pedido." 
              target="_blank" 
              rel="noreferrer"
              className="btn-cta-whatsapp"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}