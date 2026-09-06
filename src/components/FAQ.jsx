import React, { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0); // Primera pregunta abierta por defecto

  const faqs = [
    {
      question: '¿Son tienda física o tienda online?',
      answer: 'Somos una tienda online y taller creativo con base en Los Teques, Edo. Miranda. No contamos con local físico de atención al público, pero realizamos entregas personales previamente coordinadas en puntos céntricos y envíos a toda Venezuela por MRW, Zoom o Tealca. Además, nuestras plantillas y recursos digitales están disponibles en línea para cualquier país.'
    },
    {
      question: '¿Cuál es el tiempo de elaboración y cómo se gestiona el pago?',
      answer: 'El tiempo de elaboración depende estrictamente del tipo de producto, su complejidad y la cantidad solicitada. Siempre comenzamos a elaborar tu pedido una vez confirmado el 50% de anticipo (abono inicial); el 50% restante se cancela al momento de la entrega personal o antes de realizar el envío nacional.'
    },
    {
      question: '¿Puedo encargar plantillas si no consigo la que busco?',
      answer: '¡Por supuesto! Si estás buscando un diseño o temática específica y no la consigues en nuestro catálogo, ¡nosotros la creamos desde cero para ti! Diseñamos plantillas personalizadas de Canva para redes sociales, fiestas, emprendimientos o papelería digital a tu gusto. Solo escríbenos por WhatsApp con tu idea.'
    },
    {
      question: '¿Cómo se envían y entregan las plantillas digitales de Canva?',
      answer: 'El acceso es 100% digital e inmediato. Al solicitar tu plantilla, nos proporcionas el correo asociado a tu cuenta de Canva y te compartimos el enlace directo de acceso. Al abrirlo, la plantilla se duplicará en tu cuenta para que la edites con total libertad desde tu celular o computadora.'
    },
    {
      question: '¿Cuáles son los métodos de pago aceptados?',
      answer: 'Aceptamos Pago Móvil y transferencias bancarias nacionales (a la tasa oficial del día). Para pagos digitales o internacionales disponemos de Zinli, Binance (USDT), PayPal y efectivo en divisas al momento de la entrega personal.'
    },
    {
      question: '¿Puedo pedir productos físicos con temática personalizada?',
      answer: '¡Totalmente! Personalizamos cake toppers, libretas, etiquetas escolares y papelería corporativa con los nombres, personajes, paletas de colores o logotipos que desees. Te presentamos la muestra digital para tu aprobación antes de comenzar la producción una vez recibido el 50% de anticipo.'
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="preguntas-frecuentes">
      <div className="faq-container">
        <div className="faq-header">
          <span className="home-section-subtitle-pink">Resolvemos tus dudas</span>
          <h2 className="faq-title">Preguntas Frecuentes</h2>
          <p className="faq-subtitle">
            Todo lo que necesitas saber sobre nuestros tiempos, envíos y recursos creativos.
          </p>
        </div>

        <div className="faq-accordion-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}
              >
                <button 
                  className="faq-question-btn"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">{faq.question}</span>
                  <span className={`faq-icon ${isOpen ? 'faq-icon-rotated' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div className="faq-answer-wrapper">
                    <p className="faq-answer-text">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sugerencia de contacto si tienen más dudas */}
        <div className="faq-footer-note">
          <span>¿Tienes otra pregunta específica? </span>
          <a 
            href="https://wa.me/584142467351?text=¡Hola%20Textiprint!%20Tengo%20una%20pregunta%20sobre%20sus%20servicios."
            target="_blank" 
            rel="noreferrer"
            className="faq-contact-link"
          >
            Chatea con nosotros por WhatsApp ✨
          </a>
        </div>
      </div>
    </section>
  );
}
