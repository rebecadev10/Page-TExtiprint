import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop: Restaura el scroll a la parte superior (0, 0)
 * cada vez que el usuario navega a una nueva ruta en la aplicación.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Forzar scroll al inicio inmediatamente
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
}

