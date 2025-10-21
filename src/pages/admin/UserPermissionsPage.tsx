import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import styles from './UserPermissionsPage.module.css';
import { Input } from '../../components/ui/Input';
import {
  listAdminUsers,
  listPermissions,
  updateUserPermissions,
} from '../../services/admin';

type UserItem = {
  id: string | number;
  nombre: string;
  apellido?: string;
  email?: string;
  mail?: string;
  estado?: string;
  grupos?: string[];
  permisos_directos?: string[];
  permisos_de_grupo?: string[];
  groups?: Array<{ id: number | string; nombre: string }>;
};

type PermDTO = {
  id?: number | string;
  idPermiso?: number | string;
  _id?: number | string;
  nombre?: string;
  nombrePermiso?: string;
  descripcion?: string;
};

export default function UserPermissionsPage() {
  const token = localStorage.getItem('token');
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [viewingUser, setViewingUser] = React.useState<UserItem | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setUserPerms] = React.useState<PermDTO[]>([]); // Used to initialize selectedPerms
  const [selectedPerms, setSelectedPerms] = React.useState<
    Set<string | number>
  >(new Set());
  const [groupPerms, setGroupPerms] = React.useState<Set<string>>(new Set());
  const [allPerms, setAllPerms] = React.useState<PermDTO[]>([]);
  const [search, setSearch] = React.useState('');
  const [permissionSearch, setPermissionSearch] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAdminUsers({}, token || undefined);
      const arr = Array.isArray(data) ? data : [];
      setUsers(arr);
      // preload permissions catalog
      try {
        const perms = await listPermissions({}, token || undefined);
        const rawP = perms as unknown as Record<string, unknown>;
        const pArr = Array.isArray(perms)
          ? perms
          : Array.isArray(rawP['permissions'])
            ? (rawP['permissions'] as unknown[])
            : Array.isArray(rawP['data'])
              ? (rawP['data'] as unknown[])
              : [];

        const mappedPerms = (Array.isArray(pArr) ? pArr : []).map(
          (p: unknown) => {
            const obj = p as Record<string, unknown>;
            return {
              id: obj['id'] ?? obj['idPermiso'] ?? '',
              nombre: obj['nombrePermiso'] ?? obj['nombre'] ?? '',
              descripcion: obj['descripcion'] ?? obj['description'] ?? '',
            } as PermDTO;
          }
        );

        setAllPerms(mappedPerms);
      } catch {
        setAllPerms([]);
      }
    } catch {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openView = async (u: UserItem) => {
    setViewingUser(u);
    setUserPerms([]);
    setSelectedPerms(new Set());
    setGroupPerms(new Set());
    setPermissionSearch('');

    // Los permisos directos son los que podemos editar
    const directPerms = u.permisos_directos || [];
    setSelectedPerms(new Set(directPerms));

    // Los permisos de grupo son de solo lectura
    const groupPermissions = u.permisos_de_grupo || [];
    setGroupPerms(new Set(groupPermissions));

    console.log('Permisos directos (editables):', directPerms);
    console.log('Permisos de grupo (solo lectura):', groupPermissions);
  };

  const togglePermission = (permName: string) => {
    const newSelected = new Set(selectedPerms);
    if (newSelected.has(permName)) {
      newSelected.delete(permName);
    } else {
      newSelected.add(permName);
    }
    setSelectedPerms(newSelected);
  };

  const savePermissions = async () => {
    if (!viewingUser) return;
    setSaving(true);
    setError(null);

    try {
      const permissionNames = Array.from(selectedPerms);

      // Convertir nombres de permisos a IDs
      const permissionIds: (string | number)[] = permissionNames
        .map(permName => {
          const permData = allPerms.find(
            p => (p.nombre ?? p.nombrePermiso ?? '') === permName
          );
          return permData?.id ?? permData?.idPermiso ?? permData?._id;
        })
        .filter(
          (id): id is string | number =>
            id !== undefined && id !== null && id !== ''
        );

      console.log('Nombres de permisos:', permissionNames);
      console.log('IDs de permisos a enviar:', permissionIds);

      await updateUserPermissions(
        viewingUser.id,
        permissionIds,
        token || undefined
      );

      // Refresh the users list to get updated permissions
      await load();
      setViewingUser(null);
    } catch (error) {
      console.error('Error guardando permisos:', error);
      setError('No se pudieron guardar los permisos');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setViewingUser(null);
    setSelectedPerms(new Set());
    setGroupPerms(new Set());
    setError(null);
  };

  const filteredUsers = users.filter(u => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(u.nombre || '')
        .toLowerCase()
        .includes(q) ||
      String(u.apellido || '')
        .toLowerCase()
        .includes(q) ||
      String(u.mail || u.email || '')
        .toLowerCase()
        .includes(q)
    );
  });

  // Filtrar permisos basado en el término de búsqueda
  const filteredPermissions = React.useMemo(() => {
    if (!permissionSearch.trim()) return allPerms;

    const term = permissionSearch.toLowerCase();
    return allPerms.filter(p => {
      const nombre = p.nombre ?? p.nombrePermiso ?? '';
      const descripcion = p.descripcion ?? '';
      return (
        nombre.toLowerCase().includes(term) ||
        descripcion.toLowerCase().includes(term)
      );
    });
  }, [allPerms, permissionSearch]);

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Asignar permisos dinámicos</h1>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div style={{ marginBottom: 12 }}>
        <Input
          placeholder='Buscar usuario...'
          fullWidth
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={String(u.id)}>
                <td>{`${u.nombre || ''} ${u.apellido || ''}`.trim()}</td>
                <td>{u.mail || u.email}</td>
                <td>
                  <div className={styles.actions}>
                    <Button variant='outline' onClick={() => openView(u)}>
                      Ver / Editar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {viewingUser && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Asignar Permisos</h3>
            <div className={styles.searchBox}>
              <Input
                label='Buscar permisos'
                placeholder='Buscar por nombre o descripción...'
                fullWidth
                value={permissionSearch}
                onChange={e => setPermissionSearch(e.target.value)}
              />
            </div>
            <div className={styles.permissionList}>
              {/* Permisos de grupo (solo lectura) */}
              {groupPerms.size > 0 && (
                <div className={styles.groupPermissionsSection}>
                  <h4
                    style={{
                      margin: '10px 0',
                      color: '#666',
                      fontSize: '14px',
                    }}
                  >
                    📋 Permisos de Grupo (solo lectura)
                  </h4>
                  {Array.from(groupPerms)
                    .filter(
                      permName =>
                        !permissionSearch.trim() ||
                        permName
                          .toLowerCase()
                          .includes(permissionSearch.toLowerCase())
                    )
                    .map(permName => {
                      const permData = allPerms.find(
                        p => (p.nombre ?? p.nombrePermiso ?? '') === permName
                      );
                      const descripcion =
                        permData?.descripcion ??
                        'Heredado de grupo - No editable';

                      return (
                        <div
                          key={`group-${permName}`}
                          className={styles.permItem}
                          style={{
                            backgroundColor: '#f5f5f5',
                            opacity: 0.8,
                            border: '1px solid #ddd',
                          }}
                        >
                          <input
                            type='checkbox'
                            checked={true}
                            disabled={true}
                            style={{ cursor: 'not-allowed' }}
                          />
                          <div className={styles.permContent}>
                            <div
                              className={styles.permName}
                              style={{ color: '#666' }}
                            >
                              {permName}
                            </div>
                            <div
                              className={styles.permDescription}
                              style={{ color: '#999', fontSize: '12px' }}
                            >
                              {descripcion}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Permisos directos asignados (editables - se pueden quitar) */}
              {selectedPerms.size > 0 && (
                <div className={styles.directPermissionsSection}>
                  <h4
                    style={{
                      margin: '10px 0',
                      color: '#28a745',
                      fontSize: '14px',
                    }}
                  >
                    ✓ Permisos Directos Asignados (se pueden quitar)
                  </h4>
                  {Array.from(selectedPerms)
                    .filter(
                      permName =>
                        !permissionSearch.trim() ||
                        String(permName)
                          .toLowerCase()
                          .includes(permissionSearch.toLowerCase())
                    )
                    .map(permName => {
                      const permData = allPerms.find(
                        p => (p.nombre ?? p.nombrePermiso ?? '') === permName
                      );
                      const descripcion =
                        permData?.descripcion ??
                        'Permiso asignado directamente';

                      return (
                        <label
                          key={`direct-${permName}`}
                          className={styles.permItem}
                          style={{
                            backgroundColor: '#e8f5e8',
                            border: '1px solid #28a745',
                          }}
                        >
                          <input
                            type='checkbox'
                            checked={true}
                            onChange={() => togglePermission(String(permName))}
                            style={{ accentColor: '#28a745' }}
                          />
                          <div className={styles.permContent}>
                            <div
                              className={styles.permName}
                              style={{ color: '#28a745' }}
                            >
                              {permName}
                            </div>
                            <div
                              className={styles.permDescription}
                              style={{ color: '#155724' }}
                            >
                              {descripcion}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                </div>
              )}

              {/* Permisos disponibles para asignar */}
              <div className={styles.availablePermissionsSection}>
                <h4
                  style={{
                    margin: '10px 0',
                    color: '#007bff',
                    fontSize: '14px',
                  }}
                >
                  📝 Permisos Disponibles para Asignar
                </h4>

                {filteredPermissions.length === 0 ? (
                  <div className={styles.noResults}>
                    {permissionSearch.trim()
                      ? 'No se encontraron permisos que coincidan con la búsqueda'
                      : 'No hay permisos disponibles'}
                  </div>
                ) : (
                  (() => {
                    const availablePerms = filteredPermissions.filter(p => {
                      const nombre = p.nombre ?? p.nombrePermiso ?? '';
                      // Solo mostrar permisos que no estén en grupos ni asignados directamente
                      return (
                        !groupPerms.has(nombre) && !selectedPerms.has(nombre)
                      );
                    });

                    if (availablePerms.length === 0) {
                      return (
                        <div className={styles.noResults}>
                          {permissionSearch.trim()
                            ? 'Todos los permisos que coinciden ya están asignados'
                            : 'Todos los permisos disponibles ya están asignados'}
                        </div>
                      );
                    }

                    return availablePerms.map(p => {
                      const maybeId = p.id ?? p.idPermiso ?? p._id;
                      if (typeof maybeId === 'undefined' || maybeId === null)
                        return null;
                      const id = maybeId as string | number;
                      const nombre = p.nombre ?? p.nombrePermiso ?? '';
                      const descripcion = p.descripcion ?? '';

                      return (
                        <label
                          key={String(id)}
                          className={styles.permItem}
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e6e6e6',
                          }}
                        >
                          <input
                            type='checkbox'
                            checked={false}
                            onChange={() => togglePermission(nombre)}
                            style={{ accentColor: '#007bff' }}
                          />
                          <div className={styles.permContent}>
                            <div className={styles.permName}>{nombre}</div>
                            {descripcion && (
                              <div className={styles.permDescription}>
                                {descripcion}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    });
                  })()
                )}
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button variant='outline' onClick={cancelEdit}>
                Cancelar
              </Button>
              <Button onClick={savePermissions} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
