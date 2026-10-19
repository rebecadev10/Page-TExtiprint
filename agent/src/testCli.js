// agent/src/testCli.js
import readline from 'readline';
import { processCustomerMessage } from './services/geminiService.js';
import { getLiveCatalogAndTasa } from './services/supabaseService.js';

console.log("=================================================");
console.log(" ✨ SIMULADOR DE CHAT - AGENTE TEXTIPRINT ✨");
console.log("=================================================");
console.log("Cargando catálogo y tasa de cambio desde Supabase...");

const { tasa, productos } = await getLiveCatalogAndTasa();
console.log(`✅ Conectado a Supabase:`);
console.log(`   - Tasa BCV: Bs. ${tasa}`);
console.log(`   - Productos cargados: ${productos.length}`);
console.log("-------------------------------------------------");
console.log("Escribe como si fueras un cliente de WhatsApp.");
console.log("Escribe 'salir' para terminar el simulador.\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const sessionId = "simulador-cliente-terminal";

function promptUser() {
  rl.question("👤 Cliente: ", async (input) => {
    const trimmed = input.trim();
    if (trimmed.toLowerCase() === 'salir' || trimmed.toLowerCase() === 'exit') {
      console.log("\n👋 ¡Simulador cerrado!");
      rl.close();
      process.exit(0);
    }

    if (!trimmed) {
      promptUser();
      return;
    }

    process.stdout.write("🤖 Textiprint Bot está escribiendo...\r");

    const { reply, requiresEscalation } = await processCustomerMessage(sessionId, trimmed);

    console.log(`\n🎀 Textiprint Bot:\n${reply}\n`);

    if (requiresEscalation) {
      console.log("🔔 [NOTIFICACIÓN INTERNA A REBECA]: La IA marcó esta conversación para revisión manual (pedido personalizado o complejo).\n");
    }

    console.log("-------------------------------------------------");
    promptUser();
  });
}

promptUser();
