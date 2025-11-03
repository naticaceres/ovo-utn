import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
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
  const [localityToDelete, setLocalityToDelete] = React.useState<{
    id: number | string;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [filterNombre, setFilterNombre] = React.useState('');
  const [modalError, setModalError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

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
    setModalError(null);
    setShowModal(true);
  };

  const confirmDelete = (id: number | string, nombre: string) => {
    setLocalityToDelete({ id, nombre });
  };

  const remove = async () => {
    if (!localityToDelete) return;

    setError(null);
    setDeleting(true);
    try {
      await deactivateLocality(
        localityToDelete.id,
        localityToDelete.nombre,
        token || undefined
      );
      setLocalityToDelete(null);
      await load();
    } catch {
      setError('No se pudo eliminar la localidad');
    } finally {
      setDeleting(false);
    }
  };

  const save = async () => {
    setModalError(null);

    if (!name.trim()) {
      setModalError('El nombre es obligatorio');
      return;
    }
    if (!selectedProvince) {
      setModalError('La provincia es obligatoria');
      return;
    }

    setSaving(true);
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
      await load();
    } catch (err: unknown) {
      let errorMessage = 'No se pudo guardar la localidad';

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

  // Función para filtrar localidades
  const filteredItems = React.useMemo(() => {
    return items.filter(it => {
      const matchNombre =
        !filterNombre ||
        it.nombre?.toLowerCase().includes(filterNombre.toLowerCase());
      return matchNombre;
    });
  }, [items, filterNombre]);

  const clearFilters = () => {
    setFilterNombre('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
        <h1>Localidades</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setName('');
            setSelectedProvince('');
            setModalError(null);
            setShowModal(true);
          }}
        >
          Agregar localidad
        </Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

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
          {filterNombre && (
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
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Mostrando <strong>{filteredItems.length}</strong> de{' '}
          <strong>{items.length}</strong> localidades
        </div>
      </div>

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
            {filteredItems.map(it => (
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
                disabled={saving}
              >
                <option value=''>Seleccionar provincia...</option>
                {provinces.map(province => (
                  <option key={province.id} value={province.id}>
                    {province.nombre}
                  </option>
                ))}
              </select>
            </div>
            {modalError && (
              <div className={styles.error} style={{ marginTop: '12px' }}>
                {modalError}
              </div>
            )}
            <div className={styles.actions}>
              <Button onClick={save} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                variant='outline'
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!localityToDelete}
        onClose={() => setLocalityToDelete(null)}
        onConfirm={remove}
        title='Confirmar Eliminación de Localidad'
        message={
          <>
            <p>
              ¿Estás seguro de que deseas eliminar la localidad{' '}
              <strong>"{localityToDelete?.nombre}"</strong>?
            </p>
            <p>Esta acción afectará a todos los usuarios de esta localidad.</p>
          </>
        }
        confirmText='Sí, Eliminar Localidad'
        cancelText='Cancelar'
        variant='danger'
        isLoading={deleting}
      />
    </div>
  );
}
