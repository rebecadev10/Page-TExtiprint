# 🤖 Agente IA de WhatsApp para Textiprint

Este agente inteligente atiende a tus clientes por WhatsApp las 24 horas, calcula montos exactos en Bolívares consultando la tasa BCV en tiempo real desde Supabase, entrega plantillas digitales de Canva/Drive de inmediato, maneja objeciones amablemente y te avisa cuando un pedido es muy complejo.

---

## 📁 Estructura del Proyecto

* **`src/config/knowledgeBase.js`**: Aquí puedes editar o agregar los enlaces directos de Google Drive o Canva para tus plantillas gratuitas y de pago.
* **`src/config/systemPrompt.js`**: El cerebro y la personalidad del bot (tono venezolano, regla del 50%, datos de Pago Móvil/Zinli).
* **`src/services/supabaseService.js`**: Consulta en tiempo real tus productos y la tasa BCV oficial.
* **`src/services/geminiService.js`**: Conexión con Google Gemini Flash y memoria de chat.
* **`src/testCli.js`**: Simulador en terminal para probar y chatear con el bot antes de WhatsApp.
* **`src/whatsappBot.js`**: Conector con código QR para vincularlo a tu WhatsApp.

---

## 🚀 Pasos para Usarlo

### 1. Coloca tu API Key de Gemini
Abre el archivo `agent/.env` y reemplaza:
```env
GEMINI_API_KEY=tu_clave_de_gemini_aqui
```
*(Obtenla gratis en menos de 1 minuto en: https://aistudio.google.com/)*

### 2. Probar el Simulador en Pantalla (Recomendado)
Para dialogar con el bot desde la terminal como si fueras un cliente:
```bash
cd agent
npm run test:cli
```

### 3. Conectarlo a tu WhatsApp Real
Para vincularlo a tu WhatsApp mediante código QR:
```bash
cd agent
npm start
```
Aparecerá un código QR en tu terminal. Ábrelo desde WhatsApp en tu teléfono en **Dispositivos Vinculados** y ¡listo! Tu agente comenzará a responder automáticamente.
