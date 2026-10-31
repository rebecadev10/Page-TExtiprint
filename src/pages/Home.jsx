import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductsList from '../components/Products';
import FAQ from '../components/FAQ';
import CanvaViewerModal from '../components/CanvaViewerModal';
import { supabase } from '../supabaseClient';
import bannerNavidadImg from '../assets/banner_navidad_selected.webp';

// 📸 Imágenes optimizadas en WebP para máxima velocidad
import topperImg from '../assets/Topper.webp';
import canvaImg from '../assets/plantillas.webp';
import etiquetasImg from '../assets/etiqueta.webp';
import corporativoImg from '../assets/Tarjetas.webp';

export default function Home() {
  const navigate = useNavigate();
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [christmasCanvaUrl, setChristmasCanvaUrl] = useState(null);
  const [showHomeCanva, setShowHomeCanva] = useState(false);

  useEffect(() => {
    async function buscarCatalogoCanva() {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('enlace_canva, nombre, categoria')
          .not('enlace_canva', 'is', null)
          .limit(10);

        if (!error && data && data.length > 0) {
          // Priorizamos el que pertenezca a la categoría de Navidad o mencione Navidad
          const navidadProd = data.find(p => 
            (p.categoria && p.categoria.toLowerCase().includes('navidad')) ||
            (p.nombre && p.nombre.toLowerCase().includes('navidad'))
          );
          setChristmasCanvaUrl(navidadProd?.enlace_canva || data[0]?.enlace_canva);
        }
      } catch (err) {
        console.warn('Aviso de catálogo Canva en Home:', err);
      }
    }
    buscarCatalogoCanva();
  }, []);

  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catId) => {
    setCategoriaFiltro(catId);
    const element = document.getElementById('catalogo-vivo');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const services = [
    { 
      id: 'toppers',
      title: 'Cake Toppers & Recuerdos Polaroid', 
      badge: '🎂 Fiestas & Recuerdos',
      desc: 'Diseños multicapa 3D, fotos tipo polaroid y papelería personalizada en corte fino para hacer brillar tus tortas y celebraciones especiales.', 
      className: 'bg-pastel-purple',
      ctaText: 'Ver toppers y fotos',
      linkUrl: null,
      img: topperImg
    },
    { 
      id: 'canva',
      title: 'Plantillas de Canva Editables', 
      badge: '⚡ Descarga Inmediata',
      desc: 'Recursos e identidades digitales listas para transformar tus redes sociales o proyectos comerciales de manera inmediata, profesional y sin complicaciones.', 
      className: 'bg-pastel-yellow',
      ctaText: 'Ver plantillas Canva',
      linkUrl: '/plantillas-digitales',
      linkText: 'Tienda Digital ↗',
      img: canvaImg
    },
    { 
      id: 'escolar',
      title: 'Kits de Etiquetas Escolares', 
      badge: '🎒 Vuelta a Clases',
      desc: 'Identificadores creativos de alta resistencia diseñados para organizar todos los útiles de los más pequeños con diseños únicos y duraderos.', 
      className: 'bg-pastel-pink',
      ctaText: 'Ver kits escolares',
      linkUrl: null,
      img: etiquetasImg
    },
    { 
      id: 'corporativo',
      title: 'Papelería e Identidad Corporativa', 
      badge: '💼 Marcas & Negocios',
      desc: 'Tarjetas de presentación, empaques y complementos impresos detalladamente para elevar la presencia de tu marca y cautivar a tus clientes desde el primer contacto.', 
      className: 'bg-pastel-cyan',
      ctaText: 'Ver papelería corporativa',
      linkUrl: '/tienda-fisica',
      linkText: 'Papelería Física ↗',
      img: corporativoImg
    },
  ];

  return (
    <div className="home-wrapper">
      
      {/* FONDO ANIMADO LIVIANO DE ALTO IMPACTO (0 KB, 60 FPS, ESTILO VIDEO AMBIENTAL) */}
      <div className="ambient-motion-backdrop" aria-hidden="true">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
        <div className="ambient-orb orb-4"></div>
        <div className="ambient-pattern-grid"></div>
        <div className="ambient-sparkles-layer">
          <span className="floating-sparkle sp-1">✨</span>
          <span className="floating-sparkle sp-2">💖</span>
          <span className="floating-sparkle sp-3">✂️</span>
          <span className="floating-sparkle sp-4">🌸</span>
          <span className="floating-sparkle sp-5">✨</span>
          <span className="floating-sparkle sp-6">🎀</span>
          <span className="floating-sparkle sp-7">⭐</span>
        </div>
      </div>
      
      {/* 1. SECCIÓN HERO OPTIMIZADA CON CRITERIOS UX */}
      <section className="home-hero-section">

        <div className="hero-container">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="hero-text-side">
            <h1 className="home-hero-title">
              Haz realidad tus ideas <br />
              <span>con papelería creativa</span>
            </h1>
            
            <p className="home-hero-desc">
              Diseño y <strong>papelería creativa en Venezuela</strong>: Cake toppers 3D, fotos tipo polaroid, kits escolares y plantillas de Canva para llenar de alegría cada detalle.
            </p>
            
            <div className="home-hero-buttons">
              <button 
                onClick={() => handleScrollToSection('catalogo-vivo')} 
                className="btn-hero-primary"
              >
                Explorar Catálogo ✨
              </button>
            </div>

            <span className="home-hero-tagline">
              ✂️ Diseño &amp; Papelería Exclusiva
            </span>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="hero-image-side">
            <div className="hero-mockup-wrapper">
              <img 
                src="/hero.webp" 
                alt="Colección Exclusiva Textiprint Showcase" 
                className="hero-showcase-img"
                width="540"
                height="432"
                fetchPriority="high"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  e.target.src = "https://placehold.co/540x400/fdf2f8/db2777?text=Textiprint+Creative+✨";
                }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* 🎄 BANNER ESPECIAL DE TEMPORADA NAVIDEÑA */}
      <section className="christmas-hero-banner" aria-label="Especial de Navidad Textiprint">
        <div 
          className="christmas-banner-container"
          style={{ backgroundImage: `url(${bannerNavidadImg})` }}
        >
          {/* Capa traslúcida suave para máxima legibilidad (Opción A) */}
          <div className="christmas-banner-overlay"></div>

          <div className="christmas-banner-content">
            <div className="christmas-banner-badge-row">
              <span className="christmas-pill">🎄 ¡Llegó la Navidad!</span>
              <span className="christmas-tag-sub">❄️ Temporada Especial Textiprint</span>
            </div>

            <h2 className="christmas-title">
              ¡Llegó la Navidad a Textiprint!
            </h2>
            <p className="christmas-desc">
              Explora todos los productos y detalles especiales que tenemos preparados para ti en esta temporada: franelas personalizadas, cake toppers festivos, papelería creativa y recuerdos mágicos para celebrar en familia.
            </p>

            <div className="christmas-cta-group">
              <button 
                type="button" 
                onClick={() => handleSelectCategory('navidad')} 
                className="btn-christmas-primary"
              >
                🎁 Ver Colección Navideña
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN NUESTROS SERVICIOS Y CATEGORÍAS */}
      <section className="home-services-section">
        <span className="home-section-subtitle-purple">¿Qué hacemos?</span>
        <h2 className="home-section-title">Servicios &amp; Categorías</h2>
        <p className="home-section-lead-text">
          Selecciona una categoría para explorar sus productos al instante o acceder a cada colección:
        </p>
        
        <div className="home-services-grid">
          {services.map((service) => {
            const isSelected = categoriaFiltro === service.id;
            return (
              <div 
                key={service.id} 
                onClick={() => handleSelectCategory(service.id)}
                className={`service-card ${service.className} ${isSelected ? 'active-filter' : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectCategory(service.id);
                  }
                }}
                aria-label={`Ver productos de ${service.title}`}
              >
                <div className="service-card-content">
                  <span className="service-card-badge">{service.badge}</span>
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-desc">{service.desc}</p>

                  <div className="service-card-footer">
                    <span className="service-card-action-btn">
                      {service.ctaText} <span className="action-arrow">↓</span>
                    </span>
                    {service.linkUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(service.linkUrl);
                        }}
                        className="service-card-sublink"
                        title={`Ir a ${service.linkText}`}
                      >
                        {service.linkText}
                      </button>
                    )}
                  </div>
                </div>
                
                {service.img && (
                  <div className="service-card-img-wrapper">
                    <img 
                      src={service.img} 
                      alt={service.title} 
                      className="service-card-img"
                      width="240"
                      height="240"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CATÁLOGO REAL ASOCIADO A SUPABASE CON FILTRO DINÁMICO */}
      <section className="home-featured-section" id="catalogo-vivo">
        <span className="home-section-subtitle-pink">Catálogo en línea</span>
        <ProductsList 
          categoriaFiltro={categoriaFiltro} 
          onSelectCategoria={setCategoriaFiltro} 
        />
      </section>

      {/* 4. PREGUNTAS FRECUENTES (FAQ) */}
      <FAQ />

      {/* 5. BANNER INFERIOR DE CONVERSIÓN */}
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

      {/* Visor Interactivo de Canva para la portada / catálogo de Navidad */}
      <CanvaViewerModal
        isOpen={showHomeCanva}
        onClose={() => setShowHomeCanva(false)}
        canvaUrl={christmasCanvaUrl}
        titulo="Catálogo de Franelas Navideñas Textiprint"
      />
    </div>
  );
}