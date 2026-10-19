# Reglas de Proyecto - Textiprint Shop

## Regla de Moneda y Precios (Estricta)
1. **Solo Bolívares (Bs.):** En todas las pantallas de cara al cliente (Home, Ficha de Producto, Tarjetas/Cards de Variantes, Carrito de Compras, Modales, Checkout y Mensajes de WhatsApp generados), **ÚNICAMENTE** se deben mostrar los precios expresados en Bolívares (`Bs. XX,XX`).
2. **Prohibido mostrar Divisas:** **NUNCA** mostrar símbolos de dólar (`$`), siglas como `USD`, `Ref.` o equivalentes en moneda extranjera en la interfaz de usuario ni en el texto para el cliente.
3. **Manejo Interno:** El cálculo matemático interno continúa usando la tasa BCV (`tasa_bcv`) obtenida de Supabase para convertir el `precio_venta` (almacenado en USD) a Bolívares, pero la salida visual al cliente debe ser 100% en Bolívares (`Bs.`).
