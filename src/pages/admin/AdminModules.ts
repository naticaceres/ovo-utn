export interface AdminModule {
  id: number;
  label: string;
  icon: string;
  category: string;
}

export const AdminModules: AdminModule[] = [
  {
    id: 1,
    label: 'Roles',
    icon: 'shield',
    category: 'main',
  },
  {
    id: 2,
    label: 'Usuarios',
    icon: 'users',
    category: 'main',
  },
  {
    id: 3,
    label: 'Instituciones',
    icon: 'university',
    category: 'main',
  },
  {
    id: 4,
    label: 'Carreras',
    icon: 'book',
    category: 'main',
  },
  {
    id: 5,
    label: 'Backups',
    icon: 'database',
    category: 'main',
  },
  {
    id: 6,
    label: 'Métricas',
    icon: 'bar-chart',
    category: 'main',
  },
  { id: 7, label: 'Aptitud', icon: 'activity', category: 'grid' },
  {
    id: 8,
    label: 'Asignación dinámica de permisos',
    icon: 'key',
    category: 'grid',
  },
  {
    id: 9,
    label: 'Auditoría de acciones del sistema',
    icon: 'refresh-cw',
    category: 'grid',
  },
  { id: 10, label: 'Carrera', icon: 'book-open', category: 'grid' },
  {
    id: 11,
    label: 'Configuración de backups',
    icon: 'settings',
    category: 'grid',
  },
  {
    id: 12,
    label: 'Backups automáticos',
    icon: 'clock',
    category: 'grid',
  },
  {
    id: 13,
    label: 'Estado de Acceso',
    icon: 'log-in',
    category: 'grid',
  },
  {
    id: 14,
    label: 'Estado Carrera–Institución',
    icon: 'home',
    category: 'grid',
  },
  {
    id: 15,
    label: 'Estado de Cuenta',
    icon: 'activity',
    category: 'grid',
  },
  {
    id: 16,
    label: 'Estado de Inscripción',
    icon: 'edit-3',
    category: 'grid',
  },
  { id: 17, label: 'Institución', icon: 'home', category: 'grid' },
  { id: 18, label: 'Usuario', icon: 'user', category: 'grid' },
  {
    id: 19,
    label: 'Usuario–Institución',
    icon: 'users',
    category: 'grid',
  },
  { id: 20, label: 'Rol', icon: 'shield', category: 'grid' },
  { id: 21, label: 'Permisos', icon: 'key', category: 'grid' },
  { id: 22, label: 'Test', icon: 'check-square', category: 'grid' },
  { id: 23, label: 'Tipo de Test', icon: 'layers', category: 'grid' },
  { id: 24, label: 'Pregunta', icon: 'list', category: 'grid' },
  { id: 25, label: 'Tipo de Pregunta', icon: 'list', category: 'grid' },
  { id: 26, label: 'Respuesta', icon: 'edit', category: 'grid' },
  {
    id: 27,
    label: 'Resultado del Test',
    icon: 'bar-chart-2',
    category: 'grid',
  },
  { id: 28, label: 'Áreas CHASIDE', icon: 'grid', category: 'grid' },
  {
    id: 29,
    label: 'Catálogo de Materias',
    icon: 'book',
    category: 'grid',
  },
  {
    id: 30,
    label: 'Parámetros del Sistema',
    icon: 'settings',
    category: 'grid',
  },
  { id: 31, label: 'Notificaciones', icon: 'bell', category: 'grid' },
  {
    id: 32,
    label: 'Dashboard de Métricas',
    icon: 'bar-chart',
    category: 'grid',
  },
  {
    id: 33,
    label: 'Logs del Sistema',
    icon: 'file-text',
    category: 'grid',
  },
  {
    id: 34,
    label: 'Soporte y Tickets',
    icon: 'help-circle',
    category: 'grid',
  },
  { id: 35, label: 'Importar Datos', icon: 'upload', category: 'grid' },
  {
    id: 36,
    label: 'Exportar Datos',
    icon: 'download',
    category: 'grid',
  },
];
