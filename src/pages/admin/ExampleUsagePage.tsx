// Ejemplo de uso del sistema de permisos

import { PermissionGuard } from '../../components/PermissionGuard';
import { usePermissions } from '../../context/use-permissions';

export function ExampleUsagePage() {
  const { userPermissions, userGroups } = usePermissions();

  return (
    <div style={{ padding: 20 }}>
      <h1>Ejemplo de Uso del Sistema de Permisos</h1>

      {/* Información del usuario */}
      <div
        style={{
          marginBottom: 30,
          padding: 16,
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
        }}
      >
        <h3>Información del Usuario</h3>
        <p>
          <strong>Permisos:</strong> {userPermissions.join(', ') || 'Ninguno'}
        </p>
        <p>
          <strong>Grupos:</strong> {userGroups.join(', ') || 'Ninguno'}
        </p>
      </div>

      {/* Ejemplo 1: Proteger contenido con un solo permiso */}
      <PermissionGuard requiredPermissions='MANAGE_USERS'>
        <div
          style={{
            padding: 16,
            backgroundColor: '#e8f5e8',
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <h3>✅ Gestión de Usuarios</h3>
          <p>Solo visible si tienes el permiso MANAGE_USERS</p>
        </div>
      </PermissionGuard>

      {/* Ejemplo 2: Proteger contenido con múltiples permisos (cualquiera) */}
      <PermissionGuard
        requiredPermissions={['BACKUP_CONFIG', 'BACKUP_RESTORE']}
      >
        <div
          style={{
            padding: 16,
            backgroundColor: '#e8f5e8',
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <h3>✅ Gestión de Backups</h3>
          <p>Solo visible si tienes BACKUP_CONFIG O BACKUP_RESTORE</p>
        </div>
      </PermissionGuard>

      {/* Ejemplo 3: Proteger contenido requiriendo TODOS los permisos */}
      <PermissionGuard
        requiredPermissions={['MANAGE_USERS', 'ASIGN_PERM']}
        requireAllPermissions={true}
      >
        <div
          style={{
            padding: 16,
            backgroundColor: '#e8f5e8',
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <h3>✅ Administración Completa de Usuarios</h3>
          <p>Solo visible si tienes MANAGE_USERS Y ASIGN_PERM</p>
        </div>
      </PermissionGuard>

      {/* Ejemplo 4: Proteger por grupo */}
      <PermissionGuard requiredGroups='Administrador'>
        <div
          style={{
            padding: 16,
            backgroundColor: '#e8f5e8',
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <h3>✅ Sección de Administradores</h3>
          <p>Solo visible si perteneces al grupo Administrador</p>
        </div>
      </PermissionGuard>

      {/* Ejemplo 5: Contenido con fallback personalizado */}
      <PermissionGuard
        requiredPermissions='PERMISSION_THAT_DOES_NOT_EXIST'
        fallback={
          <div
            style={{
              padding: 16,
              backgroundColor: '#f5e8e8',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <h3>❌ Sección Restringida</h3>
            <p>No tienes acceso a esta funcionalidad especial.</p>
          </div>
        }
      >
        <div
          style={{
            padding: 16,
            backgroundColor: '#e8f5e8',
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <h3>✅ Funcionalidad Especial</h3>
          <p>Este contenido no se mostrará debido al permiso inexistente</p>
        </div>
      </PermissionGuard>

      {/* Ejemplo 6: Elementos de interfaz condicionales */}
      <div style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
        <h3>Botones Condicionales</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <PermissionGuard requiredPermissions='MANAGE_USERS'>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Gestionar Usuarios
            </button>
          </PermissionGuard>

          <PermissionGuard requiredPermissions='VIEW_STATS'>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Ver Estadísticas
            </button>
          </PermissionGuard>

          <PermissionGuard requiredPermissions='BACKUP_CONFIG'>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Configurar Backups
            </button>
          </PermissionGuard>

          <PermissionGuard requiredPermissions='AUDIT_HISTORY'>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Ver Auditoría
            </button>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}
