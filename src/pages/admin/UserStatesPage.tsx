import React from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import styles from './UserStatesPage.module.css';
import { Input } from '../../components/ui/Input';
import {
  listUserStates,
  createUserState,
  updateUserState,
  deactivateUserState,
} from '../../services/admin';

type StateItem = {
  id: number | string;
  nombre: string;
  activo?: boolean;
  fechaFin?: string | null;
};

export default function UserStatesPage() {
  const [items, setItems] = React.useState<StateItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<StateItem | null>(null);
  const [name, setName] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUserStates({ includeInactive: 1 });
      // service now normalizes fechaFin/activo; accept arrays or wrapped responses
      const toObj = (v: unknown): Record<string, unknown> =>
        v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
      if (Array.isArray(data)) {
        setItems(data as StateItem[]);
      } else {
        const o = toObj(data);
        if (Array.isArray(o['userStatuses']))
          setItems(o['userStatuses'] as StateItem[]);
        else if (Array.isArray(o['userStates']))
          setItems(o['userStates'] as StateItem[]);
        else setItems([]);
      }
    } catch {
      setError('No se pudieron cargar los estados');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setShowModal(true);
  };

  const openEdit = (it: StateItem) => {
    setEditing(it);
    setName(it.nombre || '');
    setShowModal(true);
  };

  const save = async () => {
    setError(null);
    try {
      if (editing) {
        await updateUserState(editing.id, { nombreEstadoUsuario: name });
      } else {
        await createUserState({ nombreEstadoUsuario: name });
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
      await deactivateUserState(id, nombre);
      load();
    } catch {
      setError('No se pudo eliminar');
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Estados de Usuario</h1>
        <Button onClick={openCreate}>+ Agregar Estado</Button>
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
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id}>
                <td>{it.nombre}</td>
                <td>
                  {(() => {
                    const rec = it as unknown as Record<string, unknown>;
                    const f =
                      rec['fechaFin'] ??
                      rec['fecha_fin'] ??
                      rec['fechaBaja'] ??
                      rec['fecha_baja'] ??
                      rec['fechaHasta'] ??
                      rec['fecha_hasta'] ??
                      rec['endDate'] ??
                      rec['end_date'] ??
                      null;
                    if (f && String(f).trim() !== '') return 'Baja';
                    return it.activo ? 'Activo' : 'Inactivo';
                  })()}
                </td>
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
            <h3>{editing ? `Editar Estado` : `Agregar Estado`}</h3>
            <Input
              label='Nombre de Estado'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <div className={styles.modalActions}>
              <Button variant='outline' onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={save} disabled={!name.trim()}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
