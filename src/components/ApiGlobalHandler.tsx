import React from 'react';
import { useToast } from './ui/toast/useToast';
import { setAuthToken } from '../context/api';

/**
 * Componente montado en el tope de la app para escuchar eventos globales
 * despachados por `src/context/api.ts` (api:unauthorized, api:forbidden, api:error)
 */
export default function ApiGlobalHandler() {
  const { showToast } = useToast();
  // evitar múltiples redirecciones repetidas
  const redirecting = React.useRef(false);
  React.useEffect(() => {
    function onUnauthorized(e: Event) {
      const detail = (e as CustomEvent)?.detail || { message: 'No autorizado' };
      const message =
        detail.message || 'Sesión expirada. Por favor inicie sesión.';
      showToast(message, { variant: 'error' });
      try {
        // limpiar estado de autenticación local sin depender de AuthProvider
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthToken(undefined);
      } catch {
        /* ignore */
      }
      if (!redirecting.current) {
        redirecting.current = true;
        // redirigir al login de manera global (funciona fuera de Router)
        try {
          window.location.replace('/app/login');
        } catch {
          // fallback: asignar href
          window.location.href = '/app/login';
        }
        // permitir re-redirecciones después de 2s
        setTimeout(() => (redirecting.current = false), 2000);
      }
    }

    function onForbidden(e: Event) {
      const detail = (e as CustomEvent)?.detail || {
        message: 'Acceso denegado',
      };
      const message =
        detail.message || 'No tiene permisos para realizar esta acción.';
      showToast(message, { variant: 'warning' });
    }

    function onApiError(e: Event) {
      const detail = (e as CustomEvent)?.detail || { message: '' };
      const message = detail.message || '';
      // Para errores generales evitamos mostrar toast en ciertos casos o duplicados.
      if (message) showToast(message, { variant: 'error' });
    }

    window.addEventListener(
      'api:unauthorized',
      onUnauthorized as EventListener
    );
    window.addEventListener('api:forbidden', onForbidden as EventListener);
    window.addEventListener('api:error', onApiError as EventListener);

    return () => {
      window.removeEventListener(
        'api:unauthorized',
        onUnauthorized as EventListener
      );
      window.removeEventListener('api:forbidden', onForbidden as EventListener);
      window.removeEventListener('api:error', onApiError as EventListener);
    };
  }, [showToast]);

  return null;
}
