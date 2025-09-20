export type Item = { id: string; label: string; icon?: string };
export type Group = { title: string; items: Item[] };
export type Category = { id: string; title: string; groups: Group[] };

export const CATEGORIES: Category[] = [
  {
    id: 'seguridad',
    title: 'Seguridad',
    groups: [
      {
        title: 'Gestión de usuarios',
        items: [
          {
            id: 'gestionar-usuarios',
            label: 'Gestionar Usuarios',
            icon: 'users-cog',
          },
          {
            id: 'asignar-permisos-dinamicos',
            label: 'Asignar permisos dinámicos a usuarios',
            icon: 'key',
          },
          {
            id: 'ver-historial-accesos',
            label: 'Ver historial de accesos',
            icon: 'clock',
          },
        ],
      },
      {
        title: 'Gestión de permisos',
        items: [
          { id: 'permisos', label: 'Gestionar Permisos', icon: 'settings' },
          {
            id: 'abm-grupos-usuarios',
            label: 'Gestionar Grupos de Usuarios',
            icon: 'users',
          },
          {
            id: 'abm-estados-usuario',
            label: 'Gestionar Estados de Usuario',
            icon: 'list',
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
          },
        ],
      },
    ],
  },

  {
    id: 'backups',
    title: 'Backups',
    groups: [
      {
        title: 'Gestión de backups',
        items: [
          { id: 'crear-backup', label: 'Crear Backup', icon: 'upload' },
          {
            id: 'restaurar-backup',
            label: 'Restaurar Backup',
            icon: 'download',
          },
          {
            id: 'consultar-backups',
            label: 'Consultar Backups',
            icon: 'file-text',
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
          },
        ],
      },
    ],
  },

  {
    id: 'carreras',
    title: 'Carreras',
    groups: [
      {
        title: 'Gestión de Carreras',
        items: [
          {
            id: 'abm-carreras-base',
            label: 'Gestionar Carreras Base',
            icon: 'book',
          },
          {
            id: 'abm-tipos-carrera',
            label: 'Gestionar Tipos de Carrera',
            icon: 'list',
          },
          {
            id: 'abm-modalidades-carrera',
            label: 'Gestionar Modalidades de Carrera',
            icon: 'grid',
          },
          {
            id: 'abm-estados-carrera-inst',
            label: 'Gestionar Estados de Carrera Institución',
            icon: 'clock',
          },
        ],
      },
    ],
  },

  {
    id: 'instituciones',
    title: 'Instituciones',
    groups: [
      {
        title: 'Aprobar/rechazar Solicitudes',
        items: [
          {
            id: 'solicitudes-instituciones',
            label: 'Solicitudes de Instituciones',
            icon: 'file-text',
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
          },
          {
            id: 'abm-estados-institucion',
            label: 'Gestionar Estados de Institución',
            icon: 'list',
          },
        ],
      },
    ],
  },

  {
    id: 'parametros',
    title: 'Parámetros Generales',
    groups: [
      {
        title: 'Ubicación',
        items: [
          { id: 'abm-paises', label: 'Gestionar Países', icon: 'grid' },
          { id: 'abm-provincias', label: 'Gestionar Provincias', icon: 'grid' },
          {
            id: 'abm-localidades',
            label: 'Gestionar Localidades',
            icon: 'grid',
          },
        ],
      },
      {
        title: 'Clasificación',
        items: [
          { id: 'abm-generos', label: 'Gestionar Géneros', icon: 'list' },
          {
            id: 'abm-tipos-acciones',
            label: 'Gestionar Tipos de Acciones del sistema',
            icon: 'list',
          },
          {
            id: 'abm-aptitudes',
            label: 'Gestionar Aptitudes',
            icon: 'activity',
          },
        ],
      },
    ],
  },

  {
    id: 'estadisticas',
    title: 'Estadísticas',
    groups: [
      {
        title: 'Monitoreo',
        items: [
          {
            id: 'tablero-estadisticas',
            label: 'Tablero de Estadísticas',
            icon: 'bar-chart-2',
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
