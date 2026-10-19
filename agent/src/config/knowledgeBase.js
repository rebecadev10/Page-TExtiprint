// agent/src/config/knowledgeBase.js
/**
 * Base de conocimiento local y enlaces directos de Textiprint.
 * Aquí puedes agregar o cambiar enlaces de Drive y Canva fácilmente
 * sin necesidad de modificar el código principal.
 */

export const knowledgeBase = {
  negocio: {
    nombre: "Textiprint",
    ubicacion: "Los Teques, Edo. Miranda, Venezuela",
    tipo: "Taller creativo y tienda online (sin local físico de atención libre)",
    entregas: "Entregas personales previamente coordinadas en Los Teques y envíos a toda Venezuela por MRW, Zoom o Tealca.",
    reglaPago: "Siempre se inicia la elaboración con el 50% de anticipo (abono inicial). El otro 50% se cancela al momento de la entrega o previo al envío nacional."
  },

  // 📂 Enlaces directos a Plantillas y Recursos (Canva / Google Drive)
  // Cuando un cliente compre o solicite una de estas, el bot puede entregarle el enlace de inmediato
  recursosDigitales: [
    {
      id: "plantilla-gratis-1",
      nombre: "Plantilla Libreta y Notas Pastel (Muestra)",
      tipo: "gratis",
      enlaceCanva: "https://www.canva.com/design/DAFexample1/view",
      enlaceDrive: "https://drive.google.com/drive/folders/example1"
    },
    {
      id: "plantilla-flips",
      nombre: "Plantilla Flips Creativa",
      tipo: "pago",
      enlaceCanva: "https://www.canva.com/design/DAFexample2/view",
      enlaceDrive: "https://drive.google.com/drive/folders/example2"
    },
    {
      id: "kit-etiquetas-escolares-digital",
      nombre: "Plantilla Etiquetas Escolares Editables",
      tipo: "pago",
      enlaceCanva: "https://www.canva.com/design/DAFexample3/view",
      enlaceDrive: "https://drive.google.com/drive/folders/example3"
    }
  ],

  // 💡 Respuestas a objeciones y situaciones frecuentes
  respuestasEspeciales: {
    clientePosponePago: "¡Tranquila, no te preocupes! ✨ Te dejo guardada tu cotización. Cuando tengas el comprobante o decidas iniciar, me avisas por aquí y con mucho gusto coordinamos tu pedido para agendarlo. ¡Quedo súper atenta! 💕",
    
    pedidoMuyPersonalizadoOIncierto: "¡Esa idea suena fabulosa y única! 🎨 Como tiene varios detalles especiales y personalizados, le pasaré esta solicitud directamente a Rebeca para que revise bien los materiales y te pase la cotización exacta. Ella te responderá por aquí en breve. 💕",

    preguntaDisenoDesdeCero: "¡Claro que sí! Si no consigues la plantilla o el motivo que buscas en nuestro catálogo, ¡nosotros la diseñamos desde cero para ti! Cuéntame qué temática, colores o idea tienes en mente y la hacemos realidad."
  }
};
