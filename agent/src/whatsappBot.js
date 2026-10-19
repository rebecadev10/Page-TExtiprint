// agent/src/whatsappBot.js
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { processCustomerMessage } from './services/geminiService.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFolder = path.join(__dirname, '../auth_info_baileys');

console.log("=================================================");
console.log(" 🚀 INICIANDO BOT DE WHATSAPP - TEXTIPRINT 🚀");
console.log("=================================================");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // Lo renderizamos manualmente con qrcode-terminal
    logger: pino({ level: 'silent' }), // Silenciar logs internos de red
    browser: ['Textiprint Agent', 'Chrome', '1.0.0']
  });

  // Guardar credenciales de sesión al actualizarse
  sock.ev.on('creds.update', saveCreds);

  // Manejar conexión y mostrar código QR si se requiere vincular
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📲 ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP (Dispositivos vinculados):\n");
      qrcode.generate(qr, { small: true });
      console.log("\n1. Abre WhatsApp en tu teléfono.");
      console.log("2. Ve a Ajustes / Menú > Dispositivos vinculados > Vincular un dispositivo.");
      console.log("3. Apunta tu cámara hacia el código QR de arriba.\n");
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('⚠️ Conexión cerrada. Reconectando...', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      } else {
        console.log('❌ Sesión cerrada por el usuario. Elimina la carpeta auth_info_baileys para reescanear.');
      }
    } else if (connection === 'open') {
      console.log('✅ ¡CONECTADO CON ÉXITO A WHATSAPP!');
      console.log('🤖 El asistente inteligente de Textiprint ya está activo respondiendo mensajes.\n');
    }
  });

  // Escuchar mensajes entrantes
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      // Ignorar mensajes enviados por nosotros mismos o estados
      if (msg.key.fromMe) continue;
      if (msg.key.remoteJid === 'status@broadcast') continue;
      // Ignorar grupos si prefieres solo atender chats privados individuales
      if (msg.key.remoteJid.endsWith('@g.us')) continue;

      const remoteJid = msg.key.remoteJid;
      const textMessage = 
        msg.message?.conversation || 
        msg.message?.extendedTextMessage?.text || 
        msg.message?.imageMessage?.caption || "";

      if (!textMessage.trim()) continue;

      console.log(`\n📩 Mensaje recibido de [${remoteJid}]: "${textMessage}"`);

      try {
        // Enviar estado de "escribiendo..." en WhatsApp
        await sock.sendPresenceUpdate('composing', remoteJid);

        // Procesar con el Cerebro de Inteligencia Artificial
        const { reply, requiresEscalation } = await processCustomerMessage(remoteJid, textMessage);

        // Detener presencia
        await sock.sendPresenceUpdate('paused', remoteJid);

        // Responder al cliente
        await sock.sendMessage(remoteJid, { text: reply });
        console.log(`📤 Respuesta enviada a [${remoteJid}]`);

        // Si la IA detectó que se requiere la intervención de Rebeca
        if (requiresEscalation && process.env.REBECA_PHONE) {
          const rebecaJid = `${process.env.REBECA_PHONE.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
          const alertaTexto = 
            `🔔 *ALERTA TEXTIPRINT BOT*\n\n` +
            `El cliente con número: *+${remoteJid.replace('@s.whatsapp.net', '')}* tiene una consulta personalizada o requiere revisión manual.\n\n` +
            `💬 *Último mensaje:* "${textMessage}"`;

          // Enviar notificación a Rebeca
          await sock.sendMessage(rebecaJid, { text: alertaTexto });
          console.log(`🔔 Notificación de escalado enviada a Rebeca (${process.env.REBECA_PHONE})`);
        }

      } catch (err) {
        console.error("Error al procesar mensaje de WhatsApp:", err);
      }
    }
  });
}

startBot().catch(console.error);
