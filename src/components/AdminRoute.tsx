import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../context/use-permissions';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege las rutas de administración
 * Solo permite acceso si el usuario tiene al menos un permiso de administración
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { userPermissions, userGroups } = usePermissions();
  const location = useLocation();

  // Lista de todos los permisos de administración
  const adminPermissions = [
    'MANAGE_PROFILE',
    'ASIGN_PERM',
    'ACCESS_HISTORY',
    'AUDIT_HISTORY',
    'USER_DEACTIVATE_SELF',
    'ADMIN_APPROVE_INSTITUTION',
    'MANAGE_INSTITUTION_REQUESTS',
    'VIEW_STATS',
    'BACKUP_CONFIG',
    'BACKUP_RESTORE',
    'MANAGE_CAREERS_CATALOG',
    'MANAGE_CAREERS_TYPES',
    'MANAGE_COUNTRIES',
    'MANAGE_PROVINCES',
    'MANAGE_LOCALITIES',
    'MANAGE_GENDERS',
    'MANAGE_USER_STATUSES',
    'MANAGE_PERMISSIONS',
    'MANAGE_GROUPS',
    'MANAGE_INSTITUTION_TYPES',
    'MANAGE_CAREER_MODALITIES',
    'MANAGE_APTITUDES',
    'MANAGE_ACCESS_STATUSES',
    'MANAGE_ACCION_TYPES',
    'MANAGE_INSTITUTION_STATES',
    'MANAGE_CAREER_INSTITUTION_STATUSES',
    'MANAGE_BACKUP_CONFIGS',
    'MANAGE_USERS',
    'MANAGE_GROUP_PERMISSIONS',
  ];

  // Verificar si el usuario tiene al menos un permiso de administración
  const hasAdminAccess = adminPermissions.some(permission =>
    userPermissions.includes(permission)
  );

  // Debug: Loggear información para ayudar con el debugging
  console.log('AdminRoute - Attempting to access:', location.pathname);
  console.log('AdminRoute - User permissions:', userPermissions);
  console.log('AdminRoute - User groups:', userGroups);
  console.log('AdminRoute - Has admin access:', hasAdminAccess);

  // Si no tiene permisos de admin, redirigir según su grupo
  if (!hasAdminAccess) {
    console.log('AdminRoute - Access denied, redirecting...');

    // Determinar a dónde redirigir según el grupo del usuario
    if (userGroups.includes('Estudiante')) {
      return <Navigate to='/app/student' replace />;
    } else if (
      userGroups.some(group => group.toLowerCase().includes('instituci'))
    ) {
      return <Navigate to='/app/institucion' replace />;
    } else {
      // Por defecto, redirigir a estudiantes
      return <Navigate to='/app/student' replace />;
    }
  }

  console.log('AdminRoute - Access granted');
  // Si tiene permisos, mostrar el contenido de administración
  return <>{children}</>;
}
