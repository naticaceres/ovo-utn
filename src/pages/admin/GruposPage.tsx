import React from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import styles from './GruposPage.module.css';
import { Input } from '../../components/ui/Input';
import {
  listGroupsCatalog,
  createGroupCatalog,
  updateGroupCatalog,
  deactivateGroupCatalog,
  listPermissions,
} from '../../services/admin';

type Group = {
  id: number | string;
  nombreGrupo: string;
  descripcion?: string;
  permisos?: Array<
    number | string | { nombrePermiso?: string; nombre?: string }
  >;
};

export default function GruposPage() {
  const token = localStorage.getItem('token');
  const [items, setItems] = React.useState<Group[]>([]);
  const [perms, setPerms] = React.useState<
    Array<{ id: number | string; nombre: string; descripcion?: string }>
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Group | null>(null);

  const [nombre, setNombre] = React.useState('');
  const [descripcion, setDescripcion] = React.useState('');
  const [selectedPerms, setSelectedPerms] = React.useState<
    Array<number | string>
  >([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [groupToDelete, setGroupToDelete] = React.useState<{
    id: number | string;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [filterNombre, setFilterNombre] = React.useState('');
  const [filterDescripcion, setFilterDescripcion] = React.useState('');
  const [filterPermisos, setFilterPermisos] = React.useState('');
  const [modalError, setModalError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listGroupsCatalog(
        { includeInactive: 1 },
        token || undefined
      );
      const raw = data as unknown as Record<string, unknown>;
      const arr = Array.isArray(data)
        ? (data as unknown[])
        : Array.isArray(raw['groups'])
          ? (raw['groups'] as unknown[])
          : Array.isArray(raw['data'])
            ? (raw['data'] as unknown[])
            : [];
      setItems(
        arr.map((g, index) => {
          const obj = g as Record<string, unknown>;
          const id =
            obj['id'] ??
            obj['idGrupo'] ??
            obj['groupId'] ??
            obj['grupo_id'] ??
            obj['_id'];

          // Ensure we have a valid ID, otherwise log a warning and use index as fallback
          if (!id && id !== 0) {
            console.warn('[GruposPage] Group missing ID:', obj);
          }

          return {
            id: (id || `temp_${index}`) as number | string,
            nombreGrupo: (obj['nombreGrupo'] ??
              obj['nombre'] ??
              obj['label'] ??
              '') as string,
            descripcion: (obj['descripcion'] ??
              obj['description'] ??
              '') as string,
            permisos: (obj['permisos'] ?? obj['permissions'] ?? []) as Array<
              number | string | Record<string, unknown>
            >,
          } as Group;
        })
      );

      // load permissions list for modal
      const pData = await listPermissions({}, token || undefined);
      const rawP = pData as unknown as Record<string, unknown>;
      const parr = Array.isArray(pData)
        ? pData
        : Array.isArray(rawP['permissions'])
          ? (rawP['permissions'] as unknown[])
          : Array.isArray(rawP['data'])
            ? (rawP['data'] as unknown[])
            : [];
      setPerms(
        (Array.isArray(parr) ? parr : []).map((p: unknown) => {
          const obj = p as Record<string, unknown>;
          return {
            id: (obj['id'] ?? obj['idPermiso'] ?? '') as number | string,
            nombre: (obj['nombrePermiso'] ?? obj['nombre'] ?? '') as string,
            descripcion: (obj['descripcion'] ??
              obj['description'] ??
              '') as string,
          };
        })
      );
    } catch {
      setError('No se pudieron cargar los grupos');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setNombre('');
    setDescripcion('');
    setSelectedPerms([]);
    setSearchTerm('');
    setModalError(null);
    setShowModal(true);
  };

  const openEdit = (it: Group) => {
    setEditing(it);
    setNombre(it.nombreGrupo || '');
    setDescripcion(it.descripcion || '');
    // normalize permisos to array of ids
    const ids = Array.isArray(it.permisos)
      ? it.permisos.map(p => {
          if (typeof p === 'object') {
            const obj = p as Record<string, unknown>;
            return (obj['id'] ??
              obj['idPermiso'] ??
              obj['nombrePermiso'] ??
              obj['nombre'] ??
              '') as number | string;
          }
          return p as number | string;
        })
      : [];
    setSelectedPerms(ids as Array<number | string>);
    setSearchTerm('');
    setModalError(null);
    setShowModal(true);
  };

  const togglePerm = (id: number | string) => {
    setSelectedPerms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // Filtrar permisos basado en el término de búsqueda
  const filteredPerms = React.useMemo(() => {
    if (!searchTerm.trim()) return perms;

    const term = searchTerm.toLowerCase();
    return perms.filter(
      p =>
        p.nombre.toLowerCase().includes(term) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term))
    );
  }, [perms, searchTerm]);

  const save = async () => {
    setModalError(null);
    setSaving(true);
    try {
      // ensure permisos are numbers when possible (backend expects ids)
      const permisosPayload = selectedPerms.map(p => {
        if (typeof p === 'string' && /^\d+$/.test(p)) return parseInt(p, 10);
        return p;
      });

      const body = {
        nombreGrupo: nombre,
        descripcion,
        permisos: permisosPayload,
      };
      console.log('[GruposPage] saving group payload:', {
        id: editing?.id,
        body,
      });
      let resp;
      if (editing) {
        console.log(
          '[GruposPage] Calling updateGroupCatalog with ID:',
          editing.id,
          'Type:',
          typeof editing.id
        );

        // Validate that we have a proper ID
        if (
          !editing.id ||
          editing.id === '' ||
          editing.id.toString().startsWith('temp_')
        ) {
          throw new Error('No se puede editar un grupo sin ID válido');
        }

        resp = await updateGroupCatalog(editing.id, body, token || undefined);
      } else {
        resp = await createGroupCatalog(body, token || undefined);
      }
      console.log('[GruposPage] save response:', resp);
      setShowModal(false);
      await load();
    } catch (err: unknown) {
      console.error('[GruposPage] save error:', err);

      let errorMessage = 'Error al guardar';

      if (err && typeof err === 'object') {
        const error = err as {
          message?: string;
          error?: string;
          details?: string;
          msg?: string;
          response?: {
            data?: {
              message?: string;
              error?: string;
            };
          };
        };

        const possibleMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          error.error ||
          error.msg ||
          error.details;

        if (possibleMessage) {
          errorMessage = possibleMessage;
        }
      }

      setModalError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: number | string, nombre: string) => {
    setGroupToDelete({ id, nombre });
  };

  const remove = async () => {
    if (!groupToDelete) return;

    setError(null);
    setDeleting(true);
    try {
      await deactivateGroupCatalog(
        groupToDelete.id,
        groupToDelete.nombre,
        token || undefined
      );
      setGroupToDelete(null);
      load();
    } catch {
      setError('No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  // Función para filtrar grupos
  const filteredItems = React.useMemo(() => {
    return items.filter(it => {
      const matchNombre =
        !filterNombre ||
        it.nombreGrupo?.toLowerCase().includes(filterNombre.toLowerCase());

      const matchDescripcion =
        !filterDescripcion ||
        it.descripcion?.toLowerCase().includes(filterDescripcion.toLowerCase());

      // Filtro por permisos - buscar en el texto de los permisos
      const permisosTexto = (it.permisos || [])
        .map(p =>
          typeof p === 'object'
            ? (p.nombrePermiso ?? p.nombre ?? '')
            : String(p)
        )
        .join(' ')
        .toLowerCase();

      const matchPermisos =
        !filterPermisos || permisosTexto.includes(filterPermisos.toLowerCase());

      return matchNombre && matchDescripcion && matchPermisos;
    });
  }, [items, filterNombre, filterDescripcion, filterPermisos]);

  const clearFilters = () => {
    setFilterNombre('');
    setFilterDescripcion('');
    setFilterPermisos('');
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Grupos de Usuarios</h1>
        <Button onClick={openCreate}>+ Agregar grupo</Button>
      </div>

      {/* Filtros */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            🔍 Filtros
          </h3>
          {(filterNombre || filterDescripcion || filterPermisos) && (
            <Button
              variant='outline'
              onClick={clearFilters}
              style={{ fontSize: '12px', padding: '4px 12px' }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          <Input
            label='Nombre'
            placeholder='Buscar por nombre...'
            value={filterNombre}
            onChange={e => setFilterNombre(e.target.value)}
            fullWidth
          />
          <Input
            label='Descripción'
            placeholder='Buscar por descripción...'
            value={filterDescripcion}
            onChange={e => setFilterDescripcion(e.target.value)}
            fullWidth
          />
          <Input
            label='Permisos'
            placeholder='Buscar por permisos...'
            value={filterPermisos}
            onChange={e => setFilterPermisos(e.target.value)}
            fullWidth
          />
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Mostrando <strong>{filteredItems.length}</strong> de{' '}
          <strong>{items.length}</strong> grupos
        </div>
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
              <th>Descripción</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(it => (
              <tr key={it.id}>
                <td>{it.nombreGrupo}</td>
                <td>{it.descripcion}</td>
                <td>
                  {(it.permisos || [])
                    .map(p =>
                      typeof p === 'object' ? (p.nombrePermiso ?? p.nombre) : p
                    )
                    .join(', ')}
                </td>
                <td>
                  <div className={styles.actions}>
                    <Button variant='outline' onClick={() => openEdit(it)}>
                      ✏️
                    </Button>
                    <Button
                      onClick={() => confirmDelete(it.id, it.nombreGrupo)}
                    >
                      🗑️
                    </Button>
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
            <h3>{editing ? `Editar grupo` : `Nuevo Grupo`}</h3>
            <Input
              label='Nombre'
              fullWidth
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
            <Input
              label='Descripción'
              fullWidth
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />

            <div className={styles.permList}>
              <strong>Permisos</strong>
              <Input
                label='Buscar permisos'
                placeholder='Buscar por nombre o descripción...'
                fullWidth
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className={styles.permScrollContainer}>
                {filteredPerms.length === 0 ? (
                  <div className={styles.noResults}>
                    {searchTerm.trim()
                      ? 'No se encontraron permisos que coincidan con la búsqueda'
                      : 'No hay permisos disponibles'}
                  </div>
                ) : (
                  filteredPerms.map(p => (
                    <label key={p.id} className={styles.permItem}>
                      <input
                        type='checkbox'
                        checked={selectedPerms.includes(p.id)}
                        onChange={() => togglePerm(p.id)}
                      />
                      <div className={styles.permContent}>
                        <div className={styles.permName}>{p.nombre}</div>
                        {p.descripcion && (
                          <div className={styles.permDescription}>
                            {p.descripcion}
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {modalError && (
              <div className={styles.error} style={{ marginTop: '12px' }}>
                {modalError}
              </div>
            )}

            <div className={styles.modalActions}>
              <Button
                variant='outline'
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={save} disabled={!nombre.trim() || saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={remove}
        title='Confirmar Eliminación de Grupo'
        message={
          <>
            <p>
              ¿Estás seguro de que deseas eliminar el grupo{' '}
              <strong>"{groupToDelete?.nombre}"</strong>?
            </p>
            <p>
              Esta acción desactivará el grupo y afectará a todos los usuarios
              asociados.
            </p>
          </>
        }
        confirmText='Sí, Eliminar Grupo'
        cancelText='Cancelar'
        variant='danger'
        isLoading={deleting}
      />
    </div>
  );
}
