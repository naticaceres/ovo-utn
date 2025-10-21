import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './AdminCrud.module.css';
import {
  listLocalities,
  createLocality,
  updateLocality,
  deactivateLocality,
  listProvinces,
} from '../../services/admin';

type Item = {
  id: number | string;
  nombre: string;
  activo?: boolean;
  idProvincia?: number | string | null;
  nombreProvincia?: string;
};

type Province = {
  id: number | string;
  nombre: string;
  activo?: boolean;
};

export default function LocalidadesPage() {
  const token = localStorage.getItem('token');
  const [items, setItems] = React.useState<Item[]>([]);
  const [provinces, setProvinces] = React.useState<Province[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [name, setName] = React.useState('');
  const [selectedProvince, setSelectedProvince] = React.useState<
    number | string | ''
  >('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listLocalities({}, token || undefined);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar las localidades');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadProvinces = React.useCallback(async () => {
    try {
      const data = await listProvinces({}, token || undefined);
      setProvinces(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar las provincias');
    }
  }, [token]);

  React.useEffect(() => {
    load();
    loadProvinces();
  }, [load, loadProvinces]);

  const openEdit = (item: Item) => {
    setEditing(item);
    setName(item.nombre);
    setSelectedProvince(item.idProvincia || '');
    setShowModal(true);
  };

  const remove = async (id: number | string, nombre: string) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await deactivateLocality(id, nombre, token || undefined);
      await load();
    } catch {
      setError('No se pudo eliminar la localidad');
    }
  };

  const save = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!selectedProvince) {
      setError('La provincia es obligatoria');
      return;
    }

    try {
      const payload = { nombre: name.trim(), idProvincia: selectedProvince };
      if (editing) {
        await updateLocality(editing.id, payload, token || undefined);
      } else {
        await createLocality(payload, token || undefined);
      }
      setShowModal(false);
      setEditing(null);
      setName('');
      setSelectedProvince('');
      setError(null);
      await load();
    } catch {
      setError('No se pudo guardar la localidad');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
        <h1>Localidades</h1>
        <Button onClick={() => setShowModal(true)}>Agregar localidad</Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Cargando...</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Provincia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id}>
                <td>{it.nombre}</td>
                <td>
                  {provinces.find(p => p.id === it.idProvincia)?.nombre ||
                    it.nombreProvincia ||
                    '-'}
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
            <h3>{editing ? `Editar localidad` : `Agregar localidad`}</h3>
            <Input
              label='Nombre de la localidad'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <div className={styles.formGroup}>
              <label htmlFor='provincia'>Provincia</label>
              <select
                id='provincia'
                value={selectedProvince}
                onChange={e => setSelectedProvince(e.target.value)}
                className={styles.select}
              >
                <option value=''>Seleccionar provincia...</option>
                {provinces.map(province => (
                  <option key={province.id} value={province.id}>
                    {province.nombre}
                  </option>
                ))}
              </select>
            </div>
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
