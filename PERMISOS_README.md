# Sistema de Permisos - Frontend

Este sistema permite mostrar/ocultar componentes y rutas según los permisos del usuario logueado.

## Estructura

### 1. Hook de Permisos (`usePermissions`)

Ubicación: `src/context/use-permissions.ts`

Proporciona funciones para verificar permisos del usuario:

```typescript
const {
  hasPermission, // Verifica un permiso específico
  hasAnyPermission, // Verifica si tiene alguno de los permisos
  hasAllPermissions, // Verifica si tiene todos los permisos
  hasGroup, // Verifica pertenencia a un grupo
  hasAnyGroup, // Verifica pertenencia a algún grupo
  userPermissions, // Lista de permisos del usuario
  userGroups, // Lista de grupos del usuario
} = usePermissions();
```

### 2. Configuración de Categorías (`adminConfig.ts`)

Ubicación: `src/pages/admin/adminConfig.ts`

Define la estructura de permisos para cada categoría y elemento:

```typescript
{
  id: 'seguridad',
  title: 'Seguridad',
  requiredPermissions: ['MANAGE_USERS', 'MANAGE_PROFILE'], // Permisos para ver la categoría
  groups: [
    {
      title: 'Gestión de usuarios',
      items: [
        {
          id: 'gestionar-usuarios',
          label: 'Gestionar Usuarios',
          requiredPermissions: ['MANAGE_USERS'] // Permisos para ver este item
        }
      ]
    }
  ]
}
```

### 3. Componente de Protección (`PermissionGuard`)

Ubicación: `src/components/PermissionGuard.tsx`

Componente React para mostrar/ocultar contenido según permisos:

```tsx
<PermissionGuard requiredPermissions='MANAGE_USERS'>
  <button>Solo visible con permiso MANAGE_USERS</button>
</PermissionGuard>
```

## Mapeo de Permisos del Backend

| Permiso Backend                      | Categorías Frontend | Descripción                            |
| ------------------------------------ | ------------------- | -------------------------------------- |
| `MANAGE_USERS`                       | Seguridad           | Gestionar usuarios del catálogo        |
| `MANAGE_PROFILE`                     | Seguridad           | Gestionar perfiles de usuario          |
| `ASIGN_PERM`                         | Seguridad           | Asignación dinámica de permisos        |
| `ACCESS_HISTORY`                     | Seguridad           | Consultar historial de accesos         |
| `AUDIT_HISTORY`                      | Seguridad           | Consultar historial de auditoría       |
| `MANAGE_PERMISSIONS`                 | Seguridad           | Gestionar catálogo de permisos         |
| `MANAGE_GROUPS`                      | Seguridad           | Gestionar grupos de usuarios           |
| `MANAGE_GROUP_PERMISSIONS`           | Seguridad           | Gestionar permisos de grupos           |
| `MANAGE_USER_STATUSES`               | Seguridad           | Gestionar estados de usuario           |
| `BACKUP_CONFIG`                      | Backups             | Ver/modificar configuración de backups |
| `BACKUP_RESTORE`                     | Backups             | Restaurar backups                      |
| `MANAGE_BACKUP_CONFIGS`              | Backups             | Gestionar configuraciones de backup    |
| `MANAGE_CAREERS_CATALOG`             | Carreras            | Gestionar catálogo de carreras         |
| `MANAGE_CAREERS_TYPES`               | Carreras            | Gestionar tipos de carrera             |
| `MANAGE_CAREER_MODALITIES`           | Carreras            | Gestionar modalidades de carrera       |
| `MANAGE_CAREER_INSTITUTION_STATUSES` | Carreras            | Gestionar estados carrera-institución  |
| `ADMIN_APPROVE_INSTITUTION`          | Instituciones       | Aprobar solicitudes de instituciones   |
| `MANAGE_INSTITUTION_REQUESTS`        | Instituciones       | Gestionar solicitudes de instituciones |
| `MANAGE_INSTITUTION_TYPES`           | Instituciones       | Gestionar tipos de institución         |
| `MANAGE_INSTITUTION_STATES`          | Instituciones       | Gestionar estados de institución       |
| `MANAGE_COUNTRIES`                   | Parámetros          | Gestionar países                       |
| `MANAGE_PROVINCES`                   | Parámetros          | Gestionar provincias                   |
| `MANAGE_LOCALITIES`                  | Parámetros          | Gestionar localidades                  |
| `MANAGE_GENDERS`                     | Parámetros          | Gestionar géneros                      |
| `MANAGE_ACCION_TYPES`                | Parámetros          | Gestionar tipos de acciones            |
| `MANAGE_APTITUDES`                   | Parámetros          | Gestionar aptitudes                    |
| `VIEW_STATS`                         | Estadísticas        | Ver estadísticas del sistema           |

## Ejemplos de Uso

### 1. Página de Administración

El `AdminHomePage` muestra solo los cuadrados que el usuario puede ver según sus permisos:

```tsx
// Solo se muestran las categorías donde el usuario tiene al menos un permiso
const visibleCategories = getVisibleCategories(userPermissions);
```

### 2. Página de Categoría

El `AdminCategoryPage` muestra solo los items permitidos dentro de una categoría:

```tsx
// Verifica acceso a la categoría
const hasAccess = category.requiredPermissions.some(permission =>
  userPermissions.includes(permission)
);

// Filtra items según permisos
const categoryWithFilteredItems = getVisibleItemsInCategory(
  category,
  userPermissions
);
```

### 3. Protección de Componentes

```tsx
// Un solo permiso
<PermissionGuard requiredPermissions="MANAGE_USERS">
  <UserManagementComponent />
</PermissionGuard>

// Múltiples permisos (cualquiera)
<PermissionGuard requiredPermissions={['BACKUP_CONFIG', 'BACKUP_RESTORE']}>
  <BackupSection />
</PermissionGuard>

// Múltiples permisos (todos requeridos)
<PermissionGuard
  requiredPermissions={['MANAGE_USERS', 'ASIGN_PERM']}
  requireAllPermissions={true}
>
  <AdvancedUserManagement />
</PermissionGuard>

// Por grupo
<PermissionGuard requiredGroups="Administrador">
  <AdminOnlyContent />
</PermissionGuard>

// Con fallback personalizado
<PermissionGuard
  requiredPermissions="SENSITIVE_OPERATION"
  fallback={<div>Acceso restringido</div>}
>
  <SensitiveContent />
</PermissionGuard>
```

### 4. Verificación Manual en Componentes

```tsx
function MyComponent() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  if (!hasPermission('VIEW_STATS')) {
    return <div>No tienes permisos para ver estadísticas</div>;
  }

  const canEdit = hasAnyPermission(['MANAGE_USERS', 'MANAGE_PROFILE']);

  return (
    <div>
      <StatisticsDisplay />
      {canEdit && <EditButton />}
    </div>
  );
}
```

## Flujo de Funcionamiento

1. **Login**: El usuario se loguea y recibe sus permisos del endpoint `/api/v1/auth/me`
2. **Almacenamiento**: Los permisos se guardan en el contexto de autenticación
3. **Verificación**: Los componentes usan `usePermissions()` para verificar acceso
4. **Filtrado**: Las páginas de administración filtran contenido según permisos
5. **Protección**: `PermissionGuard` oculta/muestra componentes automáticamente

## Extensión del Sistema

Para agregar nuevos permisos:

1. **Backend**: Agregar el permiso a la base de datos
2. **adminConfig.ts**: Agregar el permiso a la categoría/item correspondiente
3. **Componentes**: Usar `PermissionGuard` o `usePermissions()` para proteger el nuevo contenido

## Debugging

En desarrollo, puedes ver los permisos activos del usuario:

```tsx
const { userPermissions, userGroups } = usePermissions();
console.log('Permisos:', userPermissions);
console.log('Grupos:', userGroups);
```

El componente `ExampleUsagePage.tsx` muestra todos los casos de uso posibles del sistema.
