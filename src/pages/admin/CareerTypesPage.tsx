import { useEffect, useState } from 'react';
import styles from './CareerTypesPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  listCareerTypes,
  createCareerType,
  updateCareerType,
  deactivateCareerType,
} from '../../services/admin';

interface CareerType {
  id: number | string;
  nombre: string;
  activo?: boolean;
}

export default function CareerTypesPage() {
  const [items, setItems] = useState<CareerType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CareerType | null>(null);
  const [name, setName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await listCareerTypes();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar los tipos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setShowModal(true);
  };

  const openEdit = (it: CareerType) => {
    setEditing(it);
    setName(it.nombre || '');
    setShowModal(true);
  };

  const save = async () => {
    setError(null);
    try {
      if (editing) {
        await updateCareerType(editing.id, { nombre: name });
      } else {
        await createCareerType({ nombre: name });
      }
      setShowModal(false);
      load();
    } catch {
      setError('Error al guardar');
    }
  };

  const remove = async (id: number | string) => {
    setError(null);
    try {
      await deactivateCareerType(id);
      load();
    } catch {
      setError('No se pudo eliminar');
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Tipos de Carrera</h1>
        <Button onClick={openCreate}>+ Agregar tipo de carrera</Button>
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
                      rec['endDate'] ??
                      rec['end_date'] ??
                      null;
                    if (f && String(f).trim() !== '') return 'Baja';
                    return it.activo ? 'Activo' : 'Inactivo';
                  })()}
                </td>
                <td>
                  <Button variant='outline' onClick={() => openEdit(it)}>
                    ✏️
                  </Button>
                  <Button onClick={() => remove(it.id)}>🗑️</Button>
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
              {editing ? 'Editar tipo de carrera' : 'Agregar tipo de carrera'}
            </h3>
            <Input
              label='Nombre'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Ingrese nombre del tipo de carrera'
            />
            <div className={styles.modalActions}>
              <Button variant='outline' onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={save}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
