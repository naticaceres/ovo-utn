import React from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import styles from './AdminCrud.module.css';
import { Input } from '../../components/ui/Input';

type Item = { id: number | string; nombre: string; activo?: boolean };

interface Props {
  title: string;
  list: () => Promise<Item[]>;
  create: (payload: { nombre: string }) => Promise<boolean>;
  update: (
    id: number | string,
    payload: { nombre: string }
  ) => Promise<boolean>;
  deactivate: (id: number | string, nombre?: string) => Promise<boolean>;
}

export default function AdminCrud({
  title,
  list,
  create,
  update,
  deactivate,
}: Props) {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [name, setName] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await list();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar los items');
    } finally {
      setLoading(false);
    }
  }, [list]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setShowModal(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setName(it.nombre || '');
    setShowModal(true);
  };

  const save = async () => {
    setError(null);
    try {
      if (editing) {
        await update(editing.id, { nombre: name });
      } else {
        await create({ nombre: name });
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
      await deactivate(id, nombre);
      load();
    } catch {
      setError('No se pudo eliminar');
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>{title}</h1>
        <Button onClick={openCreate}>+ Agregar</Button>
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
                <td>{it.activo ? 'Activo' : 'Inactivo'}</td>
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
            <h3>
              {editing
                ? `Editar ${title.toLowerCase()}`
                : `Agregar ${title.toLowerCase()}`}
            </h3>
            <Input
              label='Nombre'
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
