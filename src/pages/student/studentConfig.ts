export type BasicStudentItem = {
  id: string;
  label: string;
  icon?: string;
  route: string;
};

export type StudentItem = {
  id: string;
  label: string;
  icon?: string;
  route: string;
  requiredPermission: string;
};

/**
 * ITEMS BÁSICOS: Siempre visibles, no requieren permisos específicos
 */
export const BASIC_STUDENT_ITEMS: BasicStudentItem[] = [
  {
    id: 'ver-perfil',
    label: 'Ver Perfil',
    icon: '👤',
    route: '/app/profile',
  },
  {
    id: 'realizar-test',
    label: 'Realizar Test',
    icon: '📝',
    route: '/app/questionnaire',
  },
  {
    id: 'historial-tests',
    label: 'Historial de Tests',
    icon: '📋',
    route: '/app/student/tests',
  },
];

/**
 * ITEMS CON PERMISOS: Cada uno requiere un permiso específico
 */
export const STUDENT_ITEMS: StudentItem[] = [
  {
    id: 'consultar-carreras',
    label: 'Consultar Carreras',
    icon: '�',
    route: '/app/careers',
    requiredPermission: 'USER_VIEW_CAREERS',
  },
  {
    id: 'consultar-instituciones',
    label: 'Consultar Instituciones',
    icon: '�',
    route: '/app/consultar-institucion',
    requiredPermission: 'USER_VIEW_INSTITUTIONS',
  },
  {
    id: 'ver-estadisticas',
    label: 'Ver Estadísticas',
    icon: '�',
    route: '/app/statistics',
    requiredPermission: 'VIEW_STATS',
  },
  {
    id: 'gestionar-usuarios',
    label: 'Gestionar Usuarios',
    icon: '👥',
    route: '/app/admin/seguridad/gestionar-usuarios',
    requiredPermission: 'MANAGE_PROFILE',
  },
  {
    id: 'asignar-permisos',
    label: 'Asignar Permisos',
    icon: '🔑',
    route: '/app/admin/seguridad/asignar-permisos-dinamicos',
    requiredPermission: 'ASIGN_PERM',
  },
  {
    id: 'ver-historial-accesos',
    label: 'Ver Historial de Accesos',
    icon: '📋',
    route: '/app/admin/seguridad/ver-historial-accesos',
    requiredPermission: 'ACCESS_HISTORY',
  },
  {
    id: 'ver-auditoria',
    label: 'Ver Auditoría',
    icon: '🔍',
    route: '/app/admin/seguridad/historial-acciones',
    requiredPermission: 'AUDIT_HISTORY',
  },
  {
    id: 'aprobar-instituciones',
    label: 'Aprobar Instituciones',
    icon: '✅',
    route: '/app/admin/instituciones/solicitudes-instituciones',
    requiredPermission: 'ADMIN_APPROVE_INSTITUTION',
  },
  {
    id: 'gestionar-solicitudes',
    label: 'Gestionar Solicitudes',
    icon: '📝',
    route: '/app/admin/instituciones/gestionar-solicitudes',
    requiredPermission: 'MANAGE_INSTITUTION_REQUESTS',
  },
  {
    id: 'configurar-backups',
    label: 'Configurar Backups',
    icon: '💾',
    route: '/app/admin/backups/crear-backup',
    requiredPermission: 'BACKUP_CONFIG',
  },
  {
    id: 'restaurar-backups',
    label: 'Restaurar Backups',
    icon: '�',
    route: '/app/admin/backups/restaurar-backup',
    requiredPermission: 'BACKUP_RESTORE',
  },
  {
    id: 'gestionar-carreras',
    label: 'Gestionar Carreras',
    icon: '📚',
    route: '/app/admin/carreras/abm-carreras-base',
    requiredPermission: 'MANAGE_CAREERS_CATALOG',
  },
  {
    id: 'gestionar-tipos-carrera',
    label: 'Tipos de Carrera',
    icon: '�',
    route: '/app/admin/carreras/abm-tipos-carrera',
    requiredPermission: 'MANAGE_CAREERS_TYPES',
  },
  {
    id: 'gestionar-paises',
    label: 'Gestionar Países',
    icon: '🌍',
    route: '/app/admin/parametros/abm-paises',
    requiredPermission: 'MANAGE_COUNTRIES',
  },
  {
    id: 'gestionar-provincias',
    label: 'Gestionar Provincias',
    icon: '🏢',
    route: '/app/admin/parametros/abm-provincias',
    requiredPermission: 'MANAGE_PROVINCES',
  },
  {
    id: 'gestionar-localidades',
    label: 'Gestionar Localidades',
    icon: '🏘️',
    route: '/app/admin/parametros/abm-localidades',
    requiredPermission: 'MANAGE_LOCALITIES',
  },
  {
    id: 'gestionar-generos',
    label: 'Gestionar Géneros',
    icon: '⚧️',
    route: '/app/admin/parametros/abm-generos',
    requiredPermission: 'MANAGE_GENDERS',
  },
  {
    id: 'gestionar-aptitudes',
    label: 'Gestionar Aptitudes',
    icon: '💪',
    route: '/app/admin/parametros/abm-aptitudes',
    requiredPermission: 'MANAGE_APTITUDES',
  },
];

/**
 * FUNCIÓN: Siempre muestra items básicos + items con permisos que el usuario tenga
 */
export function getVisibleStudentItems(
  userPermissions: string[]
): (BasicStudentItem | StudentItem)[] {
  console.log('StudentConfig - User permissions:', userPermissions);

  // Siempre incluir items básicos
  const visibleItems: (BasicStudentItem | StudentItem)[] = [
    ...BASIC_STUDENT_ITEMS,
  ];

  // Si tiene permisos, agregar items que coincidan
  if (userPermissions.length > 0) {
    const permissionBasedItems = STUDENT_ITEMS.filter(item => {
      const hasPermission = userPermissions.includes(item.requiredPermission);
      console.log(
        `StudentConfig - Item ${item.id}: requires ${item.requiredPermission}, user has: ${hasPermission}`
      );
      return hasPermission;
    });

    visibleItems.push(...permissionBasedItems);
  }

  console.log(
    'StudentConfig - Visible items count:',
    visibleItems.length,
    '(',
    BASIC_STUDENT_ITEMS.length,
    'básicos +',
    visibleItems.length - BASIC_STUDENT_ITEMS.length,
    'con permisos)'
  );
  return visibleItems;
}
