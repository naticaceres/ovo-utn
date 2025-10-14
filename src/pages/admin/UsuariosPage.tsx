import React from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import styles from './AdminCrud.module.css';
import { Input } from '../../components/ui/Input';
import {
  listAdminUsers,
  createAdminUser,
  updateUser,
  deactivateAdminUser,
  listGroupsCatalog,
  listUserStates,
  userGroups,
  listGenders,
  listLocalities,
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
  estado?: string | null;
  fechaFin?: string | null;
  groups?: Array<{ id: number | string; nombre: string }>;
};

export default function UsuariosPage() {
  const token = localStorage.getItem('token');
  const [items, setItems] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<UserItem | null>(null);

  const [nombre, setNombre] = React.useState('');
  const [apellido, setApellido] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [dni, setDni] = React.useState('');
  const [fechaNac, setFechaNac] = React.useState('');
  const [rol, setRol] = React.useState('Usuario');
  const [groups, setGroups] = React.useState<
    Array<{ id: number | string; nombre: string }>
  >([]);
  const [states, setStates] = React.useState<
    Array<{ id: number | string; nombre: string }>
  >([]);
  const [genders, setGenders] = React.useState<
    Array<{ id: number | string; nombre: string }>
  >([]);
  const [localities, setLocalities] = React.useState<
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
  const [selectedGender, setSelectedGender] = React.useState<
    number | string | null
  >(null);
  const [selectedLocality, setSelectedLocality] = React.useState<
    number | string | null
  >(null);

  // Estados para filtros
  const [allItems, setAllItems] = React.useState<UserItem[]>([]);
  const [filterByState, setFilterByState] = React.useState<string>('');

  // no password required for admin-created users per API

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdminUsers({}, token || undefined);
      const users = Array.isArray(data) ? (data as UserItem[]) : [];
      // fetch groups for each user in parallel and attach normalized groups
      try {
        const promises = users.map(u => userGroups(u.id, token || undefined));
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
        setAllItems(enriched);
        setItems(enriched);
      } catch {
        // if userGroups fails, fallback to users without groups
        setAllItems(users);
        setItems(users);
      }
      // also load groups and states
      try {
        const g = await listGroupsCatalog(
          { includeInactive: 1 },
          token || undefined
        );
        console.log('[UsuariosPage] Groups loaded:', g);

        // Map GroupCatalogDTO to expected format
        const mappedGroups = Array.isArray(g)
          ? g.map(group => ({
              id: group.id,
              nombre: group.nombreGrupo,
            }))
          : [];

        setGroups(mappedGroups);
      } catch (error) {
        console.error('[UsuariosPage] Error loading groups:', error);
        setGroups([]);
      }

      try {
        const s = await listUserStates({}, token || undefined);
        setStates(Array.isArray(s) ? s : []);
      } catch {
        setStates([]);
      }

      try {
        const g = await listGenders({}, token || undefined);
        setGenders(Array.isArray(g) ? g : []);
      } catch {
        setGenders([]);
      }

      try {
        const l = await listLocalities({}, token || undefined);
        setLocalities(Array.isArray(l) ? l : []);
      } catch {
        setLocalities([]);
      }
    } catch {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Función para filtrar usuarios por estado
  const applyFilter = React.useCallback(() => {
    if (!filterByState || filterByState === '') {
      setItems(allItems);
    } else {
      const filtered = allItems.filter(user => {
        // Primero intentar obtener el estado desde los campos directos del usuario
        let userState = user.estado ?? user.estadoNombre;

        // Si no hay estado directo, inferir basándose en otros campos
        if (!userState) {
          const rec = user as unknown as Record<string, unknown>;
          const f =
            rec['fechaFin'] ??
            rec['fecha_fin'] ??
            rec['fechaBaja'] ??
            rec['fecha_baja'] ??
            rec['endDate'] ??
            rec['end_date'] ??
            null;

          // Inferir estado basándose en condiciones
          if (f && String(f).trim() !== '') {
            userState = 'Baja';
          } else if (user.activo === false) {
            userState = 'Suspendido'; // Cambiar de 'Bloqueado' a 'Suspendido' según la API
          } else {
            userState = 'Activo';
          }
        }

        // Comparar estado (case insensitive)
        return (
          userState && userState.toLowerCase() === filterByState.toLowerCase()
        );
      });

      setItems(filtered);
    }
  }, [allItems, filterByState]);

  // Aplicar filtro cuando cambie el estado seleccionado
  React.useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setNombre('');
    setApellido('');
    setEmail('');
    setDni('');
    setFechaNac('');
    setRol('Usuario');
    setSelectedGroup(null);
    setSelectedGroups([]);
    setSelectedState(null);
    setSelectedGender(null);
    setSelectedLocality(null);
    setShowModal(true);
  };

  const openEdit = (it: UserItem) => {
    console.log('[UsuariosPage] Opening edit for user:', it);
    console.log('[UsuariosPage] Available groups:', groups);
    console.log('[UsuariosPage] User groups:', it.groups);

    setEditing(it);
    setNombre(it.nombre || '');
    setApellido(it.apellido || '');
    setEmail(it.email || '');
    setDni(''); // DNI no se edita en modo edición
    setFechaNac(''); // Fecha de nacimiento no se edita en modo edición
    setRol(it.rol || 'Usuario');
    setSelectedGroup(it.idGrupo ?? null);
    // preselect groups if available
    setSelectedGroups((it.groups || []).map(g => g.id));
    setSelectedState(it.idEstadoUsuario ?? null);
    setSelectedGender(null); // Género no se edita en modo edición
    setSelectedLocality(null); // Localidad no se edita en modo edición
    setShowModal(true);
  };

  const save = async () => {
    setError(null);
    try {
      if (!selectedState) {
        setError('Debe seleccionar un estado');
        return;
      }
      if (editing) {
        await updateUser(editing.id, {
          nombre,
          apellido,
          email,
          grupos:
            selectedGroups.length > 0
              ? selectedGroups
              : selectedGroup
                ? [selectedGroup]
                : [],
          idEstado: selectedState,
          idEstadoUsuario: selectedState,
          idGrupos: selectedGroups,
          idGrupo: selectedGroup,
          estadoInicial: selectedState,
        });
      } else {
        // Validaciones adicionales para creación
        if (!selectedGender) {
          setError('Debe seleccionar un género');
          return;
        }
        if (!selectedLocality) {
          setError('Debe seleccionar una localidad');
          return;
        }
        if (!dni.trim()) {
          setError('Debe ingresar el DNI');
          return;
        }
        if (!fechaNac) {
          setError('Debe ingresar la fecha de nacimiento');
          return;
        }

        await createAdminUser(
          {
            nombre,
            apellido,
            email,
            correo: email,
            dni,
            fechaNac,
            idGenero: selectedGender,
            idLocalidad: selectedLocality,
            estadoInicial: selectedState,
            rol,
            idGrupo:
              selectedGroups.length > 0 ? selectedGroups[0] : selectedGroup,
            idGrupos: selectedGroups,
            idEstadoUsuario: selectedState,
          },
          token || undefined
        );
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
      await deactivateAdminUser(id, nombre, token || undefined);
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

      {/* Filtro por estado */}
      <div className={styles.filters}>
        <label htmlFor='stateFilter'>Filtrar por estado:</label>
        <select
          id='stateFilter'
          className={styles.select}
          value={filterByState}
          onChange={e => setFilterByState(e.target.value)}
        >
          <option value=''>Todos los estados</option>
          {states.map(state => (
            <option key={String(state.id)} value={state.nombre}>
              {state.nombre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
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
                <td>{u.apellido}</td>
                <td>{u.email}</td>
                <td>
                  {u.groups && u.groups.length > 0
                    ? u.groups.map(g => g.nombre).join(', ')
                    : u.rol}
                </td>
                <td>
                  {u.estado ??
                    u.estadoNombre ??
                    (() => {
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
                      if (u.activo === false) return 'Suspendido';
                      return 'Activo';
                    })()}
                </td>
                <td>
                  <div className={styles.actions}>
                    <Button variant='outline' onClick={() => openEdit(u)}>
                      ✏️
                    </Button>
                    <Button
                      onClick={() =>
                        remove(u.id, `${u.nombre} ${u.apellido}`.trim())
                      }
                    >
                      🗑️
                    </Button>
                    {/* Botones de bloquear/desbloquear eliminados según nueva API */}
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
            <div style={{ display: 'flex', gap: 12 }}>
              <Input
                label='Nombre'
                fullWidth
                value={nombre}
                onChange={e => setNombre(e.target.value)}
              />
              <Input
                label='Apellido'
                fullWidth
                value={apellido}
                onChange={e => setApellido(e.target.value)}
              />
            </div>
            <Input
              label='Email'
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={!!editing}
            />

            {!editing && (
              <>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Input
                    label='DNI'
                    fullWidth
                    value={dni}
                    onChange={e => setDni(e.target.value)}
                  />
                  <Input
                    label='Fecha de Nacimiento'
                    type='date'
                    fullWidth
                    value={fechaNac}
                    onChange={e => setFechaNac(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>
                      Género *
                    </label>
                    <select
                      value={selectedGender ?? ''}
                      onChange={e => setSelectedGender(e.target.value || null)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 6,
                        border: '1px solid #e6e6e6',
                      }}
                    >
                      <option value=''>Seleccione género</option>
                      {genders.map(g => (
                        <option key={String(g.id)} value={String(g.id)}>
                          {g.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>
                      Localidad *
                    </label>
                    <select
                      value={selectedLocality ?? ''}
                      onChange={e =>
                        setSelectedLocality(e.target.value || null)
                      }
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 6,
                        border: '1px solid #e6e6e6',
                      }}
                    >
                      <option value=''>Seleccione localidad</option>
                      {localities.map(l => (
                        <option key={String(l.id)} value={String(l.id)}>
                          {l.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
            <label style={{ display: 'block', marginTop: 12 }}>Grupos</label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 6,
              }}
            >
              {groups.length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic' }}>
                  Cargando grupos...
                </div>
              ) : (
                groups.map(g => {
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
                })
              )}
            </div>

            <label style={{ display: 'block', marginTop: 12 }}>
              Estado del usuario
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
              {selectedState == null && (
                <option value=''>Seleccione estado</option>
              )}
              {states.map(s => (
                <option key={String(s.id)} value={String(s.id)}>
                  {s.nombre}
                </option>
              ))}
            </select>
            {!selectedState && (
              <div style={{ color: '#c00', fontSize: 12, marginTop: 4 }}>
                Seleccione un estado obligatorio
              </div>
            )}

            {/* no password field required for admin-created users */}

            <div className={styles.modalActions}>
              <Button variant='outline' onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={save}
                disabled={
                  !nombre.trim() ||
                  !apellido.trim() ||
                  !email.trim() ||
                  !selectedState ||
                  (!editing &&
                    (!dni.trim() ||
                      !fechaNac ||
                      !selectedGender ||
                      !selectedLocality))
                }
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
