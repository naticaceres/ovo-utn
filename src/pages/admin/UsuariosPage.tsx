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
  userGroups,
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
  fechaFin?: string | null;
  groups?: Array<{ id: number | string; nombre: string }>;
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
  const [selectedGroups, setSelectedGroups] = React.useState<
    Array<number | string>
  >([]);
  const [selectedState, setSelectedState] = React.useState<
    number | string | null
  >(null);
  // no password required for admin-created users per API

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdminUsers();
      const users = Array.isArray(data) ? (data as UserItem[]) : [];
      // fetch groups for each user in parallel and attach normalized groups
      try {
        const promises = users.map(u => userGroups(u.id));
        const results = await Promise.all(promises);
        const toObj = (v: unknown): Record<string, unknown> =>
          v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
        const enriched = users.map((u, idx) => {
          const gdata = results[idx];
          let raw = Array.isArray(gdata)
            ? gdata
            : (toObj(gdata)['groups'] ?? toObj(gdata)['data'] ?? gdata ?? []);
          if (!Array.isArray(raw)) raw = [];
          const normalized = (raw as unknown[]).map(item => {
            const obj = item as Record<string, unknown>;
            return {
              id: (obj['id'] ??
                obj['idGrupo'] ??
                obj['groupId'] ??
                obj['_id']) as number | string,
              nombre: (obj['nombre'] ??
                obj['nombreGrupo'] ??
                obj['label'] ??
                obj['name'] ??
                '') as string,
            };
          });
          return { ...u, groups: normalized } as UserItem;
        });
        setItems(enriched);
      } catch {
        // if userGroups fails, fallback to users without groups
        setItems(users);
      }
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
    setSelectedGroups([]);
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
    // preselect groups if available
    setSelectedGroups((it.groups || []).map(g => g.id));
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
          idGrupos?: Array<number | string>;
          idEstadoUsuario?: number | string | null;
        } = {
          nombre,
          apellido,
          rol,
          idGrupo:
            selectedGroups.length > 0 ? selectedGroups[0] : selectedGroup,
          idGrupos: selectedGroups,
          idEstadoUsuario: selectedState,
        };
        await updateAdminUser(editing.id, body);
      } else {
        await createAdminUser({
          nombre,
          apellido,
          email,
          rol,
          idGrupo:
            selectedGroups.length > 0 ? selectedGroups[0] : selectedGroup,
          idGrupos: selectedGroups,
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
                <td>
                  {u.groups && u.groups.length > 0
                    ? u.groups.map(g => g.nombre).join(', ')
                    : u.rol}
                </td>
                <td>
                  {(() => {
                    const rec = u as unknown as Record<string, unknown>;
                    const f =
                      rec['fechaFin'] ??
                      rec['fecha_fin'] ??
                      rec['fechaBaja'] ??
                      rec['fecha_baja'] ??
                      rec['endDate'] ??
                      rec['end_date'] ??
                      null;
                    if (f && String(f).trim() !== '') return 'Baja';
                    // blocked if activo === false
                    if (u.activo === false) return 'Bloqueado';
                    return 'Activo';
                  })()}
                </td>
                <td>
                  <div className={styles.actions}>
                    <Button variant='outline' onClick={() => openEdit(u)}>
                      ✏️
                    </Button>
                    <Button onClick={() => remove(u.id, u.nombre)}>🗑️</Button>
                    {/* Determine blocked state more reliably: prefer explicit idEstadoUsuario or activo flag */}
                    {(() => {
                      // Backend mapping:
                      // idEstadoUsuario === '1' => activo (desbloqueado) -> show closed padlock (🔒) to block
                      // idEstadoUsuario === '2' => suspendido (bloqueado) -> show open padlock (🔓) to unblock
                      const state =
                        typeof u.idEstadoUsuario !== 'undefined' &&
                        u.idEstadoUsuario !== null
                          ? String(u.idEstadoUsuario)
                          : u.activo === false
                            ? '2'
                            : '1';

                      if (state === '1') {
                        // user is active; show closed padlock to perform block
                        return (
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
                        );
                      }

                      // state === '2' -> suspended: show open padlock to unblock
                      return (
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
                      );
                    })()}
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
            <label style={{ display: 'block', marginTop: 12 }}>Grupos</label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 6,
              }}
            >
              {groups.map(g => {
                const gid = String(g.id);
                const checked = selectedGroups.map(String).includes(gid);
                return (
                  <label
                    key={gid}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <input
                      type='checkbox'
                      checked={checked}
                      onChange={() => {
                        setSelectedGroups(prev =>
                          prev.map(String).includes(gid)
                            ? prev.filter(p => String(p) !== gid)
                            : [...prev, g.id]
                        );
                      }}
                    />
                    {g.nombre}
                  </label>
                );
              })}
            </div>

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
