// agent/src/services/supabaseService.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Caché en memoria para no saturar Supabase en cada mensaje
let cachedCatalog = null;
let cachedTasa = 1;
let lastFetch = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos

/**
 * Obtiene la tasa BCV actual y los productos disponibles desde Supabase.
 */
export async function getLiveCatalogAndTasa() {
  const now = Date.now();
  if (cachedCatalog && (now - lastFetch < CACHE_TTL_MS)) {
    return { tasa: cachedTasa, productos: cachedCatalog };
  }

  if (!supabase) {
    console.warn("⚠️ Supabase no configurado en .env. Usando valores por defecto.");
    return { tasa: 1, productos: [] };
  }

  try {
    // 1. Consultar tasa BCV
    const { data: configData } = await supabase
      .from('configuraciones')
      .select('valor')
      .eq('clave', 'tasa_bcv')
      .single();

    if (configData?.valor) {
      cachedTasa = parseFloat(configData.valor);
    }

    // 2. Consultar productos y variantes
    const { data: prodData } = await supabase
      .from('productos')
      .select(`
        id,
        nombre,
        descripcion,
        tipo,
        product_variations (
          id,
          presentacion,
          precio_venta
        )
      `);

    cachedCatalog = prodData || [];
    lastFetch = now;

    return { tasa: cachedTasa, productos: cachedCatalog };
  } catch (error) {
    console.error("Error al consultar Supabase desde el agente:", error.message);
    return { tasa: cachedTasa, productos: cachedCatalog || [] };
  }
}
