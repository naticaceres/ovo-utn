import React from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
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
    setShowModal(true);
  };

  const openEdit = (it: Perm) => {
    setEditing(it);
    setNombre(it.nombre || '');
    setDescripcion(it.descripcion || '');
    setShowModal(true);
  };

  const save = async () => {
    setError(null);
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
      load();
    } catch {
      setError('Error al guardar');
    }
  };

  const remove = async (id: number | string, nombre?: string) => {
    setError(null);
    try {
      await deactivatePermission(id, nombre, token || undefined);
      load();
    } catch {
      setError('No se pudo eliminar');
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Permisos</h1>
        <Button onClick={openCreate}>+ Agregar permiso</Button>
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
            {items.map(it => (
              <tr key={it.id}>
                <td>{it.nombre}</td>
                <td>{it.descripcion}</td>
                <td>
                  <div className={styles.actions}>
                    <Button variant='outline' onClick={() => openEdit(it)}>
                      ✏️
                    </Button>
                    <Button onClick={() => remove(it.id, it.nombre)}>🗑️</Button>
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

            <div className={styles.modalActions}>
              <Button variant='outline' onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={save} disabled={!nombre.trim()}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
