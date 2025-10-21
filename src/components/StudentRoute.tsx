import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../context/use-permissions';

interface StudentRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege las rutas de estudiante
 * SIMPLE: Si el usuario está logueado, puede acceder
 * El filtrado de funcionalidades se hace en cada página individual
 */
export function StudentRoute({ children }: StudentRouteProps) {
  const { user } = usePermissions();
  const location = useLocation();

  console.log('StudentRoute - Attempting to access:', location.pathname);
  console.log('StudentRoute - User logged in:', !!user);

  // Si no está logueado, redirigir al login
  if (!user) {
    console.log('StudentRoute - Not logged in, redirecting to login');
    return <Navigate to='/app/login' replace />;
  }

  console.log('StudentRoute - Access granted (user is logged in)');
  // Si está logueado, mostrar el contenido
  // El filtrado de funcionalidades se hace en cada página individual
  return <>{children}</>;
}
