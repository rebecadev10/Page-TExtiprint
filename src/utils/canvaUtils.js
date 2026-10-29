// src/utils/canvaUtils.js

/**
 * Normaliza cualquier formato de enlace de Canva (URL directa, enlace de compartir,
 * enlace de visualización o código HTML <iframe>) a una URL embed válida lista para un iframe.
 * 
 * @param {string} input - Enlace o código embed de Canva
 * @returns {string|null} - URL directa para el iframe con ?embed o null si no es válida
 */
export function getCanvaEmbedUrl(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // 1. Si el usuario pegó el código iframe completo de Canva
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    return ensureEmbedParam(iframeSrcMatch[1]);
  }

  // 2. Si es una URL de diseño de Canva
  if (trimmed.includes('canva.com/design/')) {
    return ensureEmbedParam(trimmed);
  }

  // 3. Si es otra URL válida
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return null;
}

/**
 * Asegura que una URL de Canva termine con el parámetro ?embed
 */
function ensureEmbedParam(url) {
  if (!url) return null;
  
  // Limpiamos espacios
  let clean = url.trim();

  // Si ya tiene ?embed o &embed
  if (clean.includes('?embed') || clean.includes('&embed')) {
    return clean;
  }

  // Quitamos query params existentes para evitar conflictos
  const base = clean.split('?')[0].replace(/\/+$/, '');

  // Si termina en /view o /watch
  if (base.endsWith('/view') || base.endsWith('/watch')) {
    return `${base}?embed`;
  }

  // Si termina con el ID del diseño o slug, agregamos /view?embed
  return `${base}/view?embed`;
}

/**
 * Verifica si una cadena contiene un enlace o embed de Canva
 */
export function isCanvaLink(input) {
  if (!input || typeof input !== 'string') return false;
  return input.includes('canva.com');
}

