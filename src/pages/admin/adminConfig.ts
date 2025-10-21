export type Item = {
  id: string;
  label: string;
  icon?: string;
  requiredPermissions?: string[];
};
export type Group = { title: string; items: Item[] };
export type Category = {
  id: string;
  title: string;
  groups: Group[];
  requiredPermissions?: string[];
};

export const CATEGORIES: Category[] = [
  {
    id: 'seguridad',
    title: 'Seguridad',
    requiredPermissions: [
      'MANAGE_USERS',
      'MANAGE_PROFILE',
      'ASIGN_PERM',
      'ACCESS_HISTORY',
      'AUDIT_HISTORY',
      'MANAGE_PERMISSIONS',
      'MANAGE_GROUPS',
      'MANAGE_GROUP_PERMISSIONS',
      'MANAGE_USER_STATUSES',
    ],
    groups: [
      {
        title: 'Gestión de usuarios',
        items: [
          {
            id: 'gestionar-usuarios',
            label: 'Gestionar Usuarios',
            icon: 'users-cog',
            requiredPermissions: ['MANAGE_USERS', 'MANAGE_PROFILE'],
          },
          {
            id: 'asignar-permisos-dinamicos',
            label: 'Asignar permisos dinámicos a usuarios',
            icon: 'key',
            requiredPermissions: ['ASIGN_PERM'],
          },
          {
            id: 'ver-historial-accesos',
            label: 'Ver historial de accesos',
            icon: 'clock',
            requiredPermissions: ['ACCESS_HISTORY'],
          },
        ],
      },
      {
        title: 'Gestión de permisos',
        items: [
          {
            id: 'permisos',
            label: 'Gestionar Permisos',
            icon: 'settings',
            requiredPermissions: ['MANAGE_PERMISSIONS'],
          },
          {
            id: 'abm-grupos-usuarios',
            label: 'Gestionar Grupos de Usuarios',
            icon: 'users',
            requiredPermissions: ['MANAGE_GROUPS', 'MANAGE_GROUP_PERMISSIONS'],
          },
          {
            id: 'abm-estados-usuario',
            label: 'Gestionar Estados de Usuario',
            icon: 'list',
            requiredPermissions: ['MANAGE_USER_STATUSES'],
          },
        ],
      },
      {
        title: 'Auditoría',
        items: [
          {
            id: 'historial-acciones',
            label: 'Ver historial de acciones del sistema',
            icon: 'file-text',
            requiredPermissions: ['AUDIT_HISTORY'],
          },
        ],
      },
    ],
  },

  {
    id: 'backups',
    title: 'Backups',
    requiredPermissions: [
      'BACKUP_CONFIG',
      'BACKUP_RESTORE',
      'MANAGE_BACKUP_CONFIGS',
    ],
    groups: [
      {
        title: 'Gestión de backups',
        items: [
          {
            id: 'crear-backup',
            label: 'Crear Backup',
            icon: 'upload',
            requiredPermissions: ['BACKUP_CONFIG'],
          },
          {
            id: 'restaurar-backup',
            label: 'Restaurar Backup',
            icon: 'download',
            requiredPermissions: ['BACKUP_RESTORE'],
          },
          {
            id: 'consultar-backups',
            label: 'Consultar Backups',
            icon: 'file-text',
            requiredPermissions: ['BACKUP_CONFIG', 'BACKUP_RESTORE'],
          },
        ],
      },
      {
        title: 'Configuración',
        items: [
          {
            id: 'abm-config-backup',
            label: 'Gestionar Configuraciones de Backup',
            icon: 'settings',
            requiredPermissions: ['MANAGE_BACKUP_CONFIGS'],
          },
        ],
      },
    ],
  },

  {
    id: 'carreras',
    title: 'Carreras',
    requiredPermissions: [
      'MANAGE_CAREERS_CATALOG',
      'MANAGE_CAREERS_TYPES',
      'MANAGE_CAREER_MODALITIES',
      'MANAGE_CAREER_INSTITUTION_STATUSES',
    ],
    groups: [
      {
        title: 'Gestión de Carreras',
        items: [
          {
            id: 'abm-carreras-base',
            label: 'Gestionar Carreras Base',
            icon: 'book',
            requiredPermissions: ['MANAGE_CAREERS_CATALOG'],
          },
          {
            id: 'abm-tipos-carrera',
            label: 'Gestionar Tipos de Carrera',
            icon: 'list',
            requiredPermissions: ['MANAGE_CAREERS_TYPES'],
          },
          {
            id: 'abm-modalidades-carrera',
            label: 'Gestionar Modalidades de Carrera',
            icon: 'grid',
            requiredPermissions: ['MANAGE_CAREER_MODALITIES'],
          },
          {
            id: 'abm-estados-carrera-inst',
            label: 'Gestionar Estados de Carrera Institución',
            icon: 'clock',
            requiredPermissions: ['MANAGE_CAREER_INSTITUTION_STATUSES'],
          },
        ],
      },
    ],
  },

  {
    id: 'instituciones',
    title: 'Instituciones',
    requiredPermissions: [
      'ADMIN_APPROVE_INSTITUTION',
      'MANAGE_INSTITUTION_REQUESTS',
      'MANAGE_INSTITUTION_TYPES',
      'MANAGE_INSTITUTION_STATES',
    ],
    groups: [
      {
        title: 'Aprobar/rechazar Solicitudes',
        items: [
          {
            id: 'solicitudes-instituciones',
            label: 'Solicitudes de Instituciones',
            icon: 'file-text',
            requiredPermissions: [
              'ADMIN_APPROVE_INSTITUTION',
              'MANAGE_INSTITUTION_REQUESTS',
            ],
          },
        ],
      },
      {
        title: 'Gestión de instituciones',
        items: [
          {
            id: 'abm-tipos-institucion',
            label: 'Gestionar Tipos de Institución',
            icon: 'layers',
            requiredPermissions: ['MANAGE_INSTITUTION_TYPES'],
          },
          {
            id: 'abm-estados-institucion',
            label: 'Gestionar Estados de Institución',
            icon: 'list',
            requiredPermissions: ['MANAGE_INSTITUTION_STATES'],
          },
        ],
      },
    ],
  },

  {
    id: 'parametros',
    title: 'Parámetros Generales',
    requiredPermissions: [
      'MANAGE_COUNTRIES',
      'MANAGE_PROVINCES',
      'MANAGE_LOCALITIES',
      'MANAGE_GENDERS',
      'MANAGE_ACCION_TYPES',
      'MANAGE_APTITUDES',
    ],
    groups: [
      {
        title: 'Ubicación',
        items: [
          {
            id: 'abm-paises',
            label: 'Gestionar Países',
            icon: 'grid',
            requiredPermissions: ['MANAGE_COUNTRIES'],
          },
          {
            id: 'abm-provincias',
            label: 'Gestionar Provincias',
            icon: 'grid',
            requiredPermissions: ['MANAGE_PROVINCES'],
          },
          {
            id: 'abm-localidades',
            label: 'Gestionar Localidades',
            icon: 'grid',
            requiredPermissions: ['MANAGE_LOCALITIES'],
          },
        ],
      },
      {
        title: 'Clasificación',
        items: [
          {
            id: 'abm-generos',
            label: 'Gestionar Géneros',
            icon: 'list',
            requiredPermissions: ['MANAGE_GENDERS'],
          },
          {
            id: 'abm-tipos-acciones',
            label: 'Gestionar Tipos de Acciones del sistema',
            icon: 'list',
            requiredPermissions: ['MANAGE_ACCION_TYPES'],
          },
          {
            id: 'abm-aptitudes',
            label: 'Gestionar Aptitudes',
            icon: 'activity',
            requiredPermissions: ['MANAGE_APTITUDES'],
          },
        ],
      },
    ],
  },

  {
    id: 'estadisticas',
    title: 'Estadísticas',
    requiredPermissions: ['VIEW_STATS'],
    groups: [
      {
        title: 'Monitoreo',
        items: [
          {
            id: 'tablero-estadisticas',
            label: 'Tablero de Estadísticas',
            icon: 'bar-chart-2',
            requiredPermissions: ['VIEW_STATS'],
          },
        ],
      },
    ],
  },
];

export const CATEGORY_ICON_KEY: Record<string, string> = {
  seguridad: 'shield',
  backups: 'database',
  carreras: 'book-open',
  instituciones: 'university',
  parametros: 'layers',
  estadisticas: 'bar-chart',
};

/**
 * Filtra las categorías según los permisos del usuario
 */
export function getVisibleCategories(userPermissions: string[]): Category[] {
  return CATEGORIES.filter(category => {
    if (
      !category.requiredPermissions ||
      category.requiredPermissions.length === 0
    ) {
      return true; // Si no hay permisos requeridos, siempre visible
    }

    // La categoría es visible si el usuario tiene al menos uno de los permisos requeridos
    return category.requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );
  });
}

/**
 * Filtra los items de una categoría según los permisos del usuario
 */
export function getVisibleItemsInCategory(
  category: Category,
  userPermissions: string[]
): Category {
  const filteredGroups = category.groups
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (
          !item.requiredPermissions ||
          item.requiredPermissions.length === 0
        ) {
          return true; // Si no hay permisos requeridos, siempre visible
        }

        // El item es visible si el usuario tiene al menos uno de los permisos requeridos
        return item.requiredPermissions.some(permission =>
          userPermissions.includes(permission)
        );
      }),
    }))
    .filter(group => group.items.length > 0); // Solo mantener grupos que tengan items visibles

  return {
    ...category,
    groups: filteredGroups,
  };
}
