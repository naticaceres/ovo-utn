import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './AdminCrud.module.css';
import {
  listCareersBase,
  createCareerBase,
  updateCareerBase,
  deactivateCareerBase,
  listCareerTypes,
} from '../../services/admin';

type Item = {
  id: number | string;
  nombre: string;
  activo?: boolean;
  idTipoCarrera?: number | string | null;
};

export default function CarrerasBasePage() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [types, setTypes] = React.useState<
    Array<{ id: number | string; nombre: string }>
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [name, setName] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<number | string | ''>(
    ''
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listCareersBase();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar las carreras');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTypes = React.useCallback(async () => {
    try {
      const data = await listCareerTypes();
      // assume data is an array or wrapped; keep simple
      const raw = Array.isArray(data) ? data : (data?.careerTypes ?? data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized = (raw || []).map((t: any) => ({
        id: t.id ?? t.idTipoCarrera ?? t._id,
        nombre: t.nombre ?? t.nombreTipo ?? t.title ?? '',
      }));
      setTypes(normalized);
    } catch {
      // ignore; types dropdown will be empty
    }
  }, []);

  React.useEffect(() => {
    load();
    loadTypes();
  }, [load, loadTypes]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSelectedType('');
    setShowModal(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setName(it.nombre || '');
    setSelectedType(it.idTipoCarrera ?? '');
    setShowModal(true);
  };

  const save = async () => {
    setError(null);
    try {
      if (editing) {
        await updateCareerBase(editing.id, {
          nombre: name,
          idTipoCarrera: selectedType,
        });
      } else {
        await createCareerBase({ nombre: name, idTipoCarrera: selectedType });
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
      await deactivateCareerBase(id, nombre || '');
      load();
    } catch {
      setError('No se pudo eliminar');
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Carrera</h1>
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
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id}>
                <td>{it.nombre}</td>
                <td>
                  {types.find(t => t.id === it.idTipoCarrera)?.nombre || '-'}
                </td>
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
            <h3>{editing ? `Editar carrera` : `Agregar carrera`}</h3>
            <Input
              label='Nombre'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <div style={{ marginTop: 8 }}>
              <label>Tipo de carrera</label>
              <select
                value={selectedType ?? ''}
                onChange={e => setSelectedType(e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 6 }}
              >
                <option value=''>-- Seleccionar --</option>
                {types.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
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
