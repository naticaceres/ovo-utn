import React from 'react';
import { usePermissions } from '../context/use-permissions';

interface PermissionGuardProps {
  /**
   * Permisos requeridos. Si es un array, el usuario debe tener AL MENOS UNO de ellos.
   */
  requiredPermissions?: string | string[];

  /**
   * Si se requieren TODOS los permisos especificados en lugar de solo uno
   */
  requireAllPermissions?: boolean;

  /**
   * Grupos requeridos. Si es un array, el usuario debe pertenecer AL MENOS A UNO de ellos.
   */
  requiredGroups?: string | string[];

  /**
   * Componente a renderizar cuando no se tienen permisos
   */
  fallback?: React.ReactNode;

  /**
   * Componentes hijos a renderizar si se tienen los permisos
   */
  children: React.ReactNode;
}

export function PermissionGuard({
  requiredPermissions,
  requiredGroups,
  requireAllPermissions = false,
  fallback = (
    <div
      style={{
        padding: 20,
        textAlign: 'center',
        color: '#666',
      }}
    >
      No tienes permisos para acceder a esta funcionalidad.
    </div>
  ),
  children,
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasGroup,
    hasAnyGroup,
  } = usePermissions();

  // Verificar permisos
  let hasRequiredPermissions = true;
  if (requiredPermissions) {
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    if (requireAllPermissions) {
      hasRequiredPermissions = hasAllPermissions(permissions);
    } else if (permissions.length === 1) {
      hasRequiredPermissions = hasPermission(permissions[0]);
    } else {
      hasRequiredPermissions = hasAnyPermission(permissions);
    }
  }

  // Verificar grupos
  let hasRequiredGroups = true;
  if (requiredGroups) {
    const groups = Array.isArray(requiredGroups)
      ? requiredGroups
      : [requiredGroups];

    if (groups.length === 1) {
      hasRequiredGroups = hasGroup(groups[0]);
    } else {
      hasRequiredGroups = hasAnyGroup(groups);
    }
  }

  // Renderizar contenido o fallback
  if (hasRequiredPermissions && hasRequiredGroups) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
