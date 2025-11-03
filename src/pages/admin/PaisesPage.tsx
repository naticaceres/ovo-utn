import React from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import styles from './AdminCrud.module.css';
import {
  listCountries,
  createCountry,
  updateCountry,
  deactivateCountry,
} from '../../services/admin';

type Item = { id: number | string; nombre: string; activo?: boolean };

export default function PaisesPage() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [name, setName] = React.useState('');
  const [itemToDelete, setItemToDelete] = React.useState<{
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
      const data = await listCountries();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar los países');
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
    setModalError(null);
    setShowModal(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setName(it.nombre || '');
    setModalError(null);
    setShowModal(true);
  };

  const save = async () => {
    setModalError(null);
    setSaving(true);
    try {
      if (editing) {
        await updateCountry(editing.id, { nombre: name });
      } else {
        await createCountry({ nombre: name });
      }
      setShowModal(false);
      await load();
    } catch (err: unknown) {
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
    setItemToDelete({ id, nombre });
  };

  const remove = async () => {
    if (!itemToDelete) return;

    setError(null);
    setDeleting(true);
    try {
      await deactivateCountry(itemToDelete.id, itemToDelete.nombre);
      setItemToDelete(null);
      load();
    } catch {
      setError('No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  // Función para filtrar países
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
        <h1>País</h1>
        <Button onClick={openCreate}>+ Agregar</Button>
      </div>

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
          <strong>{items.length}</strong> países
        </div>
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(it => (
              <tr key={it.id}>
                <td>{it.nombre}</td>
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
            <h3>{editing ? `Editar país` : `Agregar país`}</h3>
            <Input
              label='Nombre'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
            />
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
              <Button onClick={save} disabled={!name.trim() || saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={remove}
        title='Confirmar Eliminación de País'
        message={
          <>
            <p>
              ¿Estás seguro de que deseas eliminar{' '}
              <strong>"{itemToDelete?.nombre}"</strong>?
            </p>
            <p>Esta acción afectará a todas las provincias de este país.</p>
          </>
        }
        confirmText='Sí, Eliminar País'
        cancelText='Cancelar'
        variant='danger'
        isLoading={deleting}
      />
    </div>
  );
}
