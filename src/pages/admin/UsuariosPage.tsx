import React from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import styles from './AdminCrud.module.css';
import { Input } from '../../components/ui/Input';
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deactivateAdminUser,
  listGroups,
  listUserStates,
  blockAdminUser,
  unblockAdminUser,
} from '../../services/admin';

type UserItem = {
  id: string | number;
  nombre: string;
  apellido?: string;
  email?: string;
  rol?: string;
  activo?: boolean;
  idGrupo?: number | string | null;
  idEstadoUsuario?: number | string | null;
  estadoNombre?: string | null;
};

export default function UsuariosPage() {
  const [items, setItems] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<UserItem | null>(null);

  const [nombre, setNombre] = React.useState('');
  const [apellido, setApellido] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [rol, setRol] = React.useState('Usuario');
  const [groups, setGroups] = React.useState<
    Array<{ id: number | string; nombre: string }>
  >([]);
  const [states, setStates] = React.useState<
    Array<{ id: number | string; nombre: string }>
  >([]);
  const [selectedGroup, setSelectedGroup] = React.useState<
    number | string | null
  >(null);
  const [selectedState, setSelectedState] = React.useState<
    number | string | null
  >(null);
  // no password required for admin-created users per API

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdminUsers();
      setItems(Array.isArray(data) ? data : []);
      // also load groups and states
      try {
        const g = await listGroups();
        setGroups(Array.isArray(g) ? g : []);
      } catch {
        setGroups([]);
      }

      try {
        const s = await listUserStates();
        setStates(Array.isArray(s) ? s : []);
      } catch {
        setStates([]);
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

  const openCreate = () => {
    setEditing(null);
    setNombre('');
    setApellido('');
    setEmail('');
    setRol('Usuario');
    setSelectedGroup(null);
    setSelectedState(null);
    setShowModal(true);
  };

  const openEdit = (it: UserItem) => {
    setEditing(it);
    setNombre(it.nombre || '');
    setApellido(it.apellido || '');
    setEmail(it.email || '');
    setRol(it.rol || 'Usuario');
    setSelectedGroup(it.idGrupo ?? null);
    setSelectedState(it.idEstadoUsuario ?? null);
    setShowModal(true);
  };

  const save = async () => {
    setError(null);
    try {
      if (editing) {
        const body: {
          nombre: string;
          apellido?: string;
          rol?: string;
          idGrupo?: number | string | null;
          idEstadoUsuario?: number | string | null;
        } = {
          nombre,
          apellido,
          rol,
          idGrupo: selectedGroup,
          idEstadoUsuario: selectedState,
        };
        await updateAdminUser(editing.id, body);
      } else {
        await createAdminUser({
          nombre,
          apellido,
          email,
          rol,
          idGrupo: selectedGroup,
          idEstadoUsuario: selectedState,
          estadoInicial: selectedState,
        });
      }
      setShowModal(false);
      load();
    } catch {
      setError('Error al guardar');
    }
  };

  const remove = async (id: string | number, nombre?: string) => {
    setError(null);
    try {
      await deactivateAdminUser(id, nombre);
      load();
    } catch {
      setError('No se pudo eliminar');
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Usuarios</h1>
        <Button onClick={openCreate}>+ Agregar usuario</Button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre y apellido</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td>{u.estadoNombre ?? (u.activo ? 'Activo' : 'Bloqueado')}</td>
                <td>
                  <div className={styles.actions}>
                    <Button variant='outline' onClick={() => openEdit(u)}>
                      ✏️
                    </Button>
                    <Button onClick={() => remove(u.id, u.nombre)}>🗑️</Button>
                    {u.activo ? (
                      <Button
                        variant='outline'
                        onClick={async () => {
                          try {
                            await blockAdminUser(u.id);
                            load();
                          } catch {
                            setError('No se pudo bloquear al usuario');
                          }
                        }}
                      >
                        🔒
                      </Button>
                    ) : (
                      <Button
                        variant='outline'
                        onClick={async () => {
                          try {
                            await unblockAdminUser(u.id);
                            load();
                          } catch {
                            setError('No se pudo desbloquear al usuario');
                          }
                        }}
                      >
                        🔓
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>{editing ? `Editar usuario` : `Agregar usuario`}</h3>
            <Input
              label='Nombre y apellido'
              fullWidth
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
            <Input
              label='Email'
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={!!editing}
            />
            <label style={{ display: 'block', marginTop: 12 }}>
              Rol o grupo
            </label>
            <select
              value={selectedGroup ?? ''}
              onChange={e => setSelectedGroup(e.target.value || null)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 6,
                border: '1px solid #e6e6e6',
                marginTop: 6,
              }}
            >
              <option value=''>-- seleccionar --</option>
              {groups.map(g => (
                <option key={String(g.id)} value={String(g.id)}>
                  {g.nombre}
                </option>
              ))}
            </select>

            <label style={{ display: 'block', marginTop: 12 }}>
              Estado inicial
            </label>
            <select
              value={selectedState ?? ''}
              onChange={e => setSelectedState(e.target.value || null)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 6,
                border: '1px solid #e6e6e6',
                marginTop: 6,
              }}
            >
              <option value=''>Activo</option>
              {states.map(s => (
                <option key={String(s.id)} value={String(s.id)}>
                  {s.nombre}
                </option>
              ))}
            </select>

            {/* no password field required for admin-created users */}

            <div className={styles.modalActions}>
              <Button variant='outline' onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={save} disabled={!nombre.trim() || !email.trim()}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
