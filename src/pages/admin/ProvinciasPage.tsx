import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
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
  const [provinceToDelete, setProvinceToDelete] = React.useState<{
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
    setModalError(null);
    setShowModal(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setName(it.nombre || '');
    setSelectedCountry(it.idPais ?? '');
    setModalError(null);
    setShowModal(true);
  };

  const save = async () => {
    setModalError(null);

    if (!selectedCountry) {
      setModalError('Debe seleccionar un país');
      return;
    }

    setSaving(true);
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
      await load();
    } catch (err: unknown) {
      // Extraer mensaje de error del backend
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
    setProvinceToDelete({ id, nombre });
  };

  const remove = async () => {
    if (!provinceToDelete) return;

    setError(null);
    setDeleting(true);
    try {
      await deactivateProvince(
        provinceToDelete.id,
        provinceToDelete.nombre,
        token || undefined
      );
      setProvinceToDelete(null);
      load();
    } catch {
      setError('No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  // Función para filtrar provincias
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
      <BackButton />
      <div className={styles.header}>
        <h1>Provincia</h1>
        <Button onClick={openCreate}>Agregar</Button>
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
          <strong>{items.length}</strong> provincias
        </div>
      </div>

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
            {filteredItems.map(it => (
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
                disabled={saving}
              >
                <option value=''>-- Seleccionar país --</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
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
              <Button
                onClick={save}
                disabled={!name.trim() || !selectedCountry || saving}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!provinceToDelete}
        onClose={() => setProvinceToDelete(null)}
        onConfirm={remove}
        title='Confirmar Eliminación de Provincia'
        message={
          <>
            <p>
              ¿Estás seguro de que deseas eliminar la provincia{' '}
              <strong>"{provinceToDelete?.nombre}"</strong>?
            </p>
            <p>
              Esta acción afectará a todas las localidades de esta provincia.
            </p>
          </>
        }
        confirmText='Sí, Eliminar Provincia'
        cancelText='Cancelar'
        variant='danger'
        isLoading={deleting}
      />
    </div>
  );
}
