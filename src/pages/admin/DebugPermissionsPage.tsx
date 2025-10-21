import { useAuth } from '../../context/use-auth';
import { usePermissions } from '../../context/use-permissions';
import { getVisibleStudentItems } from '../student/studentConfig';

export default function DebugPermissionsPage() {
  const { user } = useAuth();
  const { userPermissions, userGroups, hasPermission } = usePermissions();

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

  const hasAnyAdminPermission = adminPermissions.some(permission =>
    userPermissions.includes(permission)
  );

  const visibleStudentItems = getVisibleStudentItems(userPermissions);
  const hasAnyStudentPermission = visibleStudentItems.length > 0;

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>🔍 Debug de Permisos</h1>

      <div style={{ marginBottom: 20 }}>
        <h2>Información del Usuario</h2>
        <pre
          style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: 5 }}
        >
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2>Datos del Hook usePermissions</h2>
        <p>
          <strong>Permisos ({userPermissions.length}):</strong>
        </p>
        <pre
          style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: 5 }}
        >
          {JSON.stringify(userPermissions, null, 2)}
        </pre>

        <p>
          <strong>Grupos ({userGroups.length}):</strong>
        </p>
        <pre
          style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: 5 }}
        >
          {JSON.stringify(userGroups, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2>Verificaciones de Permisos</h2>
        <p>
          <strong>¿Tiene algún permiso de admin?</strong>{' '}
          {hasAnyAdminPermission ? '✅ SÍ' : '❌ NO'}
        </p>
        <p>
          <strong>¿Tiene algún permiso de estudiante?</strong>{' '}
          {hasAnyStudentPermission ? '✅ SÍ' : '❌ NO'}
        </p>

        <h3>Items/Cuadrados Visibles ({visibleStudentItems.length}):</h3>
        <div style={{ marginBottom: 16 }}>
          {visibleStudentItems.map(item => {
            const isBasic = !('requiredPermission' in item);
            return (
              <div
                key={item.id}
                style={{
                  padding: 5,
                  backgroundColor: isBasic ? '#f0f8ff' : '#e8f5e8',
                  borderRadius: 3,
                  fontSize: 12,
                  marginBottom: 4,
                  borderLeft: `3px solid ${isBasic ? '#2196F3' : '#4CAF50'}`,
                }}
              >
                {isBasic ? '🔓' : '✅'} {item.label} ({item.route})
                <div style={{ fontSize: 10, color: '#666' }}>
                  {isBasic
                    ? 'Funcionalidad básica (siempre visible)'
                    : `Requiere: ${'requiredPermission' in item ? item.requiredPermission : ''}`}
                </div>
              </div>
            );
          })}

          <div
            style={{
              marginTop: 10,
              padding: 8,
              backgroundColor: '#f9f9f9',
              borderRadius: 4,
              fontSize: 11,
            }}
          >
            <strong>Resumen:</strong>{' '}
            {
              visibleStudentItems.filter(
                item => !('requiredPermission' in item)
              ).length
            }{' '}
            básicos +{' '}
            {
              visibleStudentItems.filter(item => 'requiredPermission' in item)
                .length
            }{' '}
            premium = {visibleStudentItems.length} total
          </div>
        </div>

        <h3>Permisos de Admin Individuales:</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 10,
          }}
        >
          {adminPermissions.map(permission => (
            <div
              key={permission}
              style={{
                padding: 5,
                backgroundColor: hasPermission(permission)
                  ? '#e8f5e8'
                  : '#f5e8e8',
                borderRadius: 3,
                fontSize: 12,
              }}
            >
              {hasPermission(permission) ? '✅' : '❌'} {permission}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2>LocalStorage</h2>
        <p>
          <strong>Token:</strong>{' '}
          {localStorage.getItem('token') ? 'Presente' : 'Ausente'}
        </p>
        <p>
          <strong>User Data:</strong>
        </p>
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: 10,
            borderRadius: 5,
            fontSize: 10,
          }}
        >
          {localStorage.getItem('user') || 'No hay datos'}
        </pre>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2>Conclusión</h2>
        {hasAnyAdminPermission ? (
          <div
            style={{ padding: 10, backgroundColor: '#e8f5e8', borderRadius: 5 }}
          >
            ✅ El usuario DEBERÍA tener acceso al panel de administración
          </div>
        ) : hasAnyStudentPermission || userPermissions.length === 0 ? (
          <div
            style={{ padding: 10, backgroundColor: '#e8f8ff', borderRadius: 5 }}
          >
            ✅ El usuario DEBERÍA tener acceso al panel de estudiante
            <br />
            Items visibles: {visibleStudentItems.length}
          </div>
        ) : (
          <div
            style={{ padding: 10, backgroundColor: '#f5e8e8', borderRadius: 5 }}
          >
            ❌ El usuario NO tiene permisos para ningún panel
            <br />
            Debería ser redirigido al login
          </div>
        )}
      </div>
    </div>
  );
}
