import React from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import styles from './AdminCrud.module.css';
import { Input } from '../../components/ui/Input';
import {
  listPermissions,
  createPermission,
  updatePermission,
  deactivatePermission,
} from '../../services/admin';

type Perm = {
  id: number | string;
  nombre: string;
  descripcion?: string;
};

export default function PermisosPage() {
  const token = localStorage.getItem('token');
  const [items, setItems] = React.useState<Perm[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Perm | null>(null);

  const [nombre, setNombre] = React.useState('');
  const [descripcion, setDescripcion] = React.useState('');
  const [permissionToDelete, setPermissionToDelete] = React.useState<{
    id: number | string;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Estados para filtros
  const [filterNombre, setFilterNombre] = React.useState('');
  const [filterDescripcion, setFilterDescripcion] = React.useState('');
  const [modalError, setModalError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPermissions({}, token || undefined);
      // API may return an array or an object like { permissions: [...] } or { catalogPermissions: [...] }
      const raw = data as unknown as Record<string, unknown>;
      let arr: unknown[] = [];
      if (Array.isArray(raw)) {
        arr = raw as unknown[];
      } else if (Array.isArray(raw['permissions'])) {
        arr = raw['permissions'] as unknown[];
      } else if (Array.isArray(raw['catalogPermissions'])) {
        arr = raw['catalogPermissions'] as unknown[];
      } else if (Array.isArray(raw['data'])) {
        arr = raw['data'] as unknown[];
      } else {
        arr = [];
      }

      setItems(
        arr.map(p => {
          const obj = p as Record<string, unknown>;
          const idVal = obj['id'] ?? obj['idPermiso'] ?? obj['_id'] ?? '';
          const nombreVal = obj['nombrePermiso'] ?? obj['nombre'] ?? '';
          const descripcionVal = obj['descripcion'] ?? obj['description'] ?? '';
          return {
            id: idVal as string,
            nombre: nombreVal as string,
            descripcion: descripcionVal as string,
          } as Perm;
        })
      );
    } catch {
      setError('No se pudieron cargar los permisos');
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
    setModalError(null);
    setShowModal(true);
  };

  const openEdit = (it: Perm) => {
    setEditing(it);
    setNombre(it.nombre || '');
    setDescripcion(it.descripcion || '');
    setModalError(null);
    setShowModal(true);
  };

  const save = async () => {
    setModalError(null);
    setSaving(true);
    try {
      if (editing) {
        await updatePermission(editing.id, {
          nombrePermiso: nombre,
          descripcion,
        });
      } else {
        await createPermission({ nombrePermiso: nombre, descripcion });
      }
      setShowModal(false);
      await load();
    } catch (err: unknown) {
      let errorMessage = 'Error al guardar';

      if (err && typeof err === 'object') {
        const error = err as {
          message?: string;
          error?: string;
          details?: string;
          msg?: string;
        };

        const possibleMessage =
          error.message || error.error || error.msg || error.details;

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
    setPermissionToDelete({ id, nombre });
  };

  const remove = async () => {
    if (!permissionToDelete) return;

    setError(null);
    setDeleting(true);
    try {
      await deactivatePermission(
        permissionToDelete.id,
        permissionToDelete.nombre,
        token || undefined
      );
      setPermissionToDelete(null);
      load();
    } catch {
      setError('No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  // Función para filtrar permisos
  const filteredItems = React.useMemo(() => {
    return items.filter(it => {
      const matchNombre =
        !filterNombre ||
        it.nombre?.toLowerCase().includes(filterNombre.toLowerCase());
      const matchDescripcion =
        !filterDescripcion ||
        it.descripcion?.toLowerCase().includes(filterDescripcion.toLowerCase());

      return matchNombre && matchDescripcion;
    });
  }, [items, filterNombre, filterDescripcion]);

  const clearFilters = () => {
    setFilterNombre('');
    setFilterDescripcion('');
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Permisos</h1>
        <Button onClick={openCreate}>+ Agregar permiso</Button>
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
          {(filterNombre || filterDescripcion) && (
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Mostrando <strong>{filteredItems.length}</strong> de{' '}
          <strong>{items.length}</strong> permisos
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(it => (
              <tr key={it.id}>
                <td>{it.nombre}</td>
                <td>{it.descripcion}</td>
                <td>
                  <div className={styles.actions}>
                    <Button variant='outline' onClick={() => openEdit(it)}>
                      ✏️
                    </Button>
                    <Button onClick={() => confirmDelete(it.id, it.nombre)}>
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
            <h3>{editing ? `Editar permiso` : `Agregar permiso`}</h3>
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
        isOpen={!!permissionToDelete}
        onClose={() => setPermissionToDelete(null)}
        onConfirm={remove}
        title='Confirmar Eliminación de Permiso'
        message={
          <>
            <p>
              ¿Estás seguro de que deseas eliminar el permiso{' '}
              <strong>"{permissionToDelete?.nombre}"</strong>?
            </p>
            <p>
              Esta acción puede afectar a grupos y usuarios que tengan este
              permiso asignado.
            </p>
            <p style={{ color: '#dc2626', fontWeight: 600 }}>
              ⚠️ Esta operación puede impactar el acceso al sistema.
            </p>
          </>
        }
        confirmText='Sí, Eliminar Permiso'
        cancelText='Cancelar'
        variant='danger'
        isLoading={deleting}
      />
    </div>
  );
}
