import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './AdminCrud.module.css';
import {
  listSkills,
  createSkill,
  updateSkill,
  deactivateSkill,
} from '../../services/admin';

type Item = {
  id: number | string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
};

export default function AptitudesPage() {
  const token = localStorage.getItem('token');
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSkills({}, token || undefined);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar las aptitudes');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openEdit = (item: Item) => {
    setEditing(item);
    setName(item.nombre);
    setDescription(item.descripcion || '');
    setShowModal(true);
  };

  const remove = async (id: number | string, nombre: string) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await deactivateSkill(id, nombre, token || undefined);
      await load();
    } catch {
      setError('No se pudo eliminar la aptitud');
    }
  };

  const save = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const payload = {
        nombre: name.trim(),
        descripcion: description.trim() || undefined,
      };
      if (editing) {
        await updateSkill(editing.id, payload, token || undefined);
      } else {
        await createSkill(payload, token || undefined);
      }
      setShowModal(false);
      setEditing(null);
      setName('');
      setDescription('');
      setError(null);
      await load();
    } catch {
      setError('No se pudo guardar la aptitud');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
        <h1>Aptitudes</h1>
        <Button onClick={() => setShowModal(true)}>Agregar aptitud</Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Cargando...</div>
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
                <td>{it.descripcion || '-'}</td>
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
            <h3>{editing ? `Editar aptitud` : `Agregar aptitud`}</h3>
            <Input
              label='Nombre de la aptitud'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              label='Descripción (opcional)'
              fullWidth
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Capacidad para...'
            />
            <div className={styles.actions}>
              <Button onClick={save}>Guardar</Button>
              <Button variant='outline' onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
