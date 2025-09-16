import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import styles from './UserPermissionsPage.module.css';
import { Input } from '../../components/ui/Input';
import {
  listAdminUsers,
  userPermissions,
  listPermissions,
  updateUserPermissions,
} from '../../services/admin';

type UserItem = {
  id: string | number;
  nombre: string;
  apellido?: string;
  email?: string;
  groups?: Array<{ id: number | string; nombre: string }>;
};

type PermDTO = {
  id?: number | string;
  idPermiso?: number | string;
  _id?: number | string;
  nombre?: string;
  nombrePermiso?: string;
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
  const [allPerms, setAllPerms] = React.useState<PermDTO[]>([]);
  const [search, setSearch] = React.useState('');
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
        const pArr = Array.isArray(perms) ? perms : [];
        setAllPerms(pArr as PermDTO[]);
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
    try {
      const data = await userPermissions(u.id, token || undefined);
      // normalize possible wrapped responses
      const arr = ((): PermDTO[] => {
        if (Array.isArray(data)) return data as PermDTO[];
        const asObj = data as unknown as Record<string, unknown>;
        if (Array.isArray(asObj['permissions']))
          return asObj['permissions'] as PermDTO[];
        if (Array.isArray(asObj['data'])) return asObj['data'] as PermDTO[];
        return [];
      })();
      setUserPerms(arr);

      // Initialize selected permissions with current user permissions
      const currentPermIds = arr
        .map(p => p.id ?? p.idPermiso ?? p._id)
        .filter(id => id !== undefined);
      setSelectedPerms(new Set(currentPermIds));
    } catch {
      setUserPerms([]);
      setError('No se pudieron cargar los permisos del usuario');
    }
  };

  const togglePermission = (permId: number | string) => {
    const newSelected = new Set(selectedPerms);
    if (newSelected.has(permId)) {
      newSelected.delete(permId);
    } else {
      newSelected.add(permId);
    }
    setSelectedPerms(newSelected);
  };

  const savePermissions = async () => {
    if (!viewingUser) return;
    setSaving(true);
    setError(null);

    try {
      const permissionsArray = Array.from(selectedPerms);
      await updateUserPermissions(
        viewingUser.id,
        permissionsArray,
        token || undefined
      );

      // Refresh the user permissions after successful save
      const data = await userPermissions(viewingUser.id, token || undefined);
      const arr = ((): PermDTO[] => {
        if (Array.isArray(data)) return data as PermDTO[];
        const asObj = data as unknown as Record<string, unknown>;
        if (Array.isArray(asObj['permissions']))
          return asObj['permissions'] as PermDTO[];
        if (Array.isArray(asObj['data'])) return asObj['data'] as PermDTO[];
        return [];
      })();
      setUserPerms(arr);

      setViewingUser(null);
    } catch {
      setError('No se pudieron guardar los permisos');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setViewingUser(null);
    setSelectedPerms(new Set());
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
      String(u.email || '')
        .toLowerCase()
        .includes(q)
    );
  });

  const userHas = (permId: number | string) => {
    return selectedPerms.has(permId);
  };

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
                <td>{u.email}</td>
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
                placeholder='Buscar permiso...'
                fullWidth
                value={''}
                onChange={() => {}}
              />
            </div>
            <div className={styles.permissionList}>
              {allPerms.map(p => {
                const maybeId = p.id ?? p.idPermiso ?? p._id;
                if (typeof maybeId === 'undefined' || maybeId === null)
                  return null;
                const id = maybeId as string | number;
                const nombre = p.nombre ?? p.nombrePermiso ?? '';
                const checked = userHas(id);
                return (
                  <label
                    key={String(id)}
                    style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                  >
                    <input
                      type='checkbox'
                      checked={checked}
                      onChange={() => togglePermission(id)}
                    />
                    {nombre}
                  </label>
                );
              })}
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
