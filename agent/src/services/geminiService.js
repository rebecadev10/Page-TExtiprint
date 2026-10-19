// agent/src/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { buildSystemPrompt } from '../config/systemPrompt.js';
import { getLiveCatalogAndTasa } from './supabaseService.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Memoria de conversación en memoria (historial por cliente)
const conversationHistories = new Map();
const MAX_HISTORY_MESSAGES = 10;

/**
 * Procesa un mensaje de un cliente usando Google Gemini.
 * @param {string} userId - Identificador único (teléfono o sesión)
 * @param {string} incomingMessage - Mensaje del cliente
 * @returns {Promise<{ reply: string, requiresEscalation: boolean }>}
 */
export async function processCustomerMessage(userId, incomingMessage) {
  if (!genAI || !apiKey || apiKey === 'tu_clave_de_gemini_aqui') {
    return {
      reply: "¡Hola! ✨ Por favor configura tu GEMINI_API_KEY en el archivo agent/.env para activar mi inteligencia artificial.",
      requiresEscalation: false
    };
  }

  try {
    // 1. Obtener datos frescos de Supabase (tasa BCV y productos)
    const liveData = await getLiveCatalogAndTasa();
    const systemInstruction = buildSystemPrompt(liveData);

    // 2. Obtener o crear historial de conversación
    let history = conversationHistories.get(userId) || [];

    // 3. Inicializar modelo con System Instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    // 4. Iniciar sesión de chat con historial
    const chat = model.startChat({
      history: history
    });

    // 5. Enviar mensaje y recibir respuesta
    const result = await chat.sendMessage(incomingMessage);
    const rawResponse = result.response.text();

    // 6. Detectar si la IA activó la etiqueta de escalado a Rebeca
    const requiresEscalation = rawResponse.includes('[ESCALAR_A_REBECA]');
    const cleanedReply = rawResponse.replace('[ESCALAR_A_REBECA]', '').trim();

    // 7. Actualizar historial
    history.push({ role: 'user', parts: [{ text: incomingMessage }] });
    history.push({ role: 'model', parts: [{ text: cleanedReply }] });

    // Limitar tamaño del historial
    if (history.length > MAX_HISTORY_MESSAGES * 2) {
      history = history.slice(-MAX_HISTORY_MESSAGES * 2);
    }
    conversationHistories.set(userId, history);

    return {
      reply: cleanedReply,
      requiresEscalation
    };

  } catch (error) {
    console.error("Error en geminiService:", error);
    return {
      reply: "¡Hola! ✨ Tuve un pequeño inconveniente temporal al procesar tu mensaje. En unos minutos Rebeca te responderá personalmente. ¡Gracias por tu paciencia! 💕",
      requiresEscalation: true
    };
  }
}
