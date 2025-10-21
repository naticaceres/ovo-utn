import { useAuth } from './use-auth';

/**
 * Hook para manejar la verificación de permisos del usuario
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permisos) return false;
    return user.permisos.includes(permission);
  };

  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.permisos) return false;
    return permissions.some(permission => user.permisos.includes(permission));
  };

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.permisos) return false;
    return permissions.every(permission => user.permisos.includes(permission));
  };

  /**
   * Verifica si el usuario pertenece a un grupo específico
   */
  const hasGroup = (group: string): boolean => {
    if (!user || !user.grupos) return false;
    return user.grupos.includes(group);
  };

  /**
   * Verifica si el usuario pertenece a alguno de los grupos especificados
   */
  const hasAnyGroup = (groups: string[]): boolean => {
    if (!user || !user.grupos) return false;
    return groups.some(group => user.grupos.includes(group));
  };

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasGroup,
    hasAnyGroup,
    // Lista de permisos del usuario para facilitar el debugging
    userPermissions: user?.permisos || [],
    userGroups: user?.grupos || [],
  };
}
