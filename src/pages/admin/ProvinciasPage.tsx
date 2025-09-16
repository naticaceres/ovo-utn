import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './AdminCrud.module.css';
import {
  listProvinces,
  createProvince,
  updateProvince,
  deactivateProvince,
  listCountries,
} from '../../services/admin';

type Item = {
  id: number | string;
  nombre: string;
  activo?: boolean;
  idPais?: number | string | null;
  nombrePais?: string;
};

type Country = {
  id: number | string;
  nombre: string;
  activo?: boolean;
};

export default function ProvinciasPage() {
  const token = localStorage.getItem('token');
  const [items, setItems] = React.useState<Item[]>([]);
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [name, setName] = React.useState('');
  const [selectedCountry, setSelectedCountry] = React.useState<
    number | string | ''
  >('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProvinces({}, token || undefined);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar las provincias');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadCountries = React.useCallback(async () => {
    try {
      const data = await listCountries({}, token || undefined);
      console.log('[ProvinciasPage] Countries loaded:', data);
      setCountries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[ProvinciasPage] Error loading countries:', error);
      setCountries([]);
    }
  }, [token]);

  React.useEffect(() => {
    load();
    loadCountries();
  }, [load, loadCountries]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSelectedCountry('');
    setShowModal(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setName(it.nombre || '');
    setSelectedCountry(it.idPais ?? '');
    setShowModal(true);
  };

  const save = async () => {
    setError(null);
    if (!selectedCountry) {
      setError('Debe seleccionar un país');
      return;
    }

    try {
      const payload = {
        nombre: name,
        idPais: selectedCountry,
      };

      if (editing) {
        await updateProvince(editing.id, payload, token || undefined);
      } else {
        await createProvince(payload, token || undefined);
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
      await deactivateProvince(id, nombre || '', token || undefined);
      load();
    } catch {
      setError('No se pudo eliminar');
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Provincia</h1>
        <Button onClick={openCreate}>Agregar</Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>País</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id}>
                <td>{it.nombre}</td>
                <td>
                  {countries.find(c => c.id === it.idPais)?.nombre ||
                    it.nombrePais ||
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
            <h3>{editing ? `Editar provincia` : `Agregar provincia`}</h3>
            <Input
              label='Nombre de la provincia'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <div style={{ marginTop: 8 }}>
              <label>País</label>
              <select
                value={selectedCountry ?? ''}
                onChange={e => setSelectedCountry(e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 6 }}
              >
                <option value=''>-- Seleccionar país --</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.modalActions}>
              <Button variant='outline' onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={save}
                disabled={!name.trim() || !selectedCountry}
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
