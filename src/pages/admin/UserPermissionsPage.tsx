import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import styles from './UserPermissionsPage.module.css';
import { Input } from '../../components/ui/Input';
import {
  listAdminUsers,
  userPermissions,
  listPermissions,
  addUserPermission,
  removeUserPermission,
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
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [viewingUser, setViewingUser] = React.useState<UserItem | null>(null);
  const [userPerms, setUserPerms] = React.useState<PermDTO[]>([]);
  const [allPerms, setAllPerms] = React.useState<PermDTO[]>([]);
  const [search, setSearch] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAdminUsers();
      const arr = Array.isArray(data) ? data : [];
      setUsers(arr);
      // preload permissions catalog
      try {
        const perms = await listPermissions();
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
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openView = async (u: UserItem) => {
    setViewingUser(u);
    setUserPerms([]);
    try {
      const data = await userPermissions(u.id);
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
    } catch {
      setUserPerms([]);
      setError('No se pudieron cargar los permisos del usuario');
    }
  };

  const togglePermission = async (permId: number | string) => {
    if (!viewingUser) return;
    setError(null);
    const has = userPerms.find(p => (p.id ?? p.idPermiso ?? p._id) === permId);
    try {
      if (has) {
        await removeUserPermission(viewingUser.id, permId);
      } else {
        await addUserPermission(viewingUser.id, permId);
      }
      // refresh list
      const data = await userPermissions(viewingUser.id);
      const arr = ((): PermDTO[] => {
        if (Array.isArray(data)) return data as PermDTO[];
        const asObj = data as unknown as Record<string, unknown>;
        if (Array.isArray(asObj['permissions']))
          return asObj['permissions'] as PermDTO[];
        if (Array.isArray(asObj['data'])) return asObj['data'] as PermDTO[];
        return [];
      })();
      setUserPerms(arr);
    } catch {
      setError('No se pudo actualizar el permiso');
    }
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
    return userPerms.some(p => (p.id ?? p.idPermiso ?? p._id) === permId);
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
              <Button variant='outline' onClick={() => setViewingUser(null)}>
                Cancelar
              </Button>
              <Button onClick={() => setViewingUser(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
