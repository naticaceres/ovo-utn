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
  fechaFin?: string | null;
};

export default function CarrerasBasePage() {
  const token = localStorage.getItem('token');
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
  const [fechaFin, setFechaFin] = React.useState<string>('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listCareersBase({}, token || undefined);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar las carreras');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadTypes = React.useCallback(async () => {
    try {
      const data = await listCareerTypes(
        { includeInactive: 1 },
        token || undefined
      );
      console.log('[CarrerasBasePage] Career types data:', data);

      // The listCareerTypes function now returns normalized data
      if (Array.isArray(data)) {
        setTypes(
          data.map(item => ({
            id: item.id,
            nombre: item.nombre,
          }))
        );
      } else {
        console.warn('[CarrerasBasePage] Expected array, got:', data);
        setTypes([]);
      }
    } catch (error) {
      console.error('[CarrerasBasePage] Error loading career types:', error);
      setTypes([]);
    }
  }, [token]);

  React.useEffect(() => {
    load();
    loadTypes();
  }, [load, loadTypes]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSelectedType('');
    setFechaFin('');
    setShowModal(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setName(it.nombre || '');
    setSelectedType(it.idTipoCarrera ?? '');

    // Handle fechaFin: if it's "NULL" or empty, set to empty string for the date input
    if (it.fechaFin && it.fechaFin !== 'NULL') {
      setFechaFin(it.fechaFin.split('T')[0]); // Convert to YYYY-MM-DD format for input
    } else {
      setFechaFin('');
    }

    setShowModal(true);
  };

  const save = async () => {
    setError(null);
    try {
      const payload = {
        nombre: name,
        idTipoCarrera: selectedType,
        fechaFin: fechaFin, // Send the value as is: date, "NULL", or empty string
      };

      console.log('[CarrerasBasePage] Saving with payload:', payload);

      if (editing) {
        await updateCareerBase(editing.id, payload, token || undefined);
      } else {
        await createCareerBase(payload, token || undefined);
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
      await deactivateCareerBase(id, nombre || '', token || undefined);
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
                <td>
                  {(() => {
                    // Check if career has an end date (fechaFin)
                    const fechaFin = it.fechaFin;
                    if (
                      fechaFin &&
                      fechaFin.trim() !== '' &&
                      fechaFin !== 'NULL'
                    ) {
                      const endDate = new Date(fechaFin);
                      const now = new Date();
                      if (endDate <= now) {
                        return `Baja (${endDate.toLocaleDateString()})`;
                      } else {
                        return `Programada baja (${endDate.toLocaleDateString()})`;
                      }
                    }
                    return it.activo !== false ? 'Activo' : 'Inactivo';
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
            <h3>
              {editing ? `Editar carrera` : `Agregar carrera`}
              {editing && editing.fechaFin && (
                <span
                  style={{
                    fontSize: '14px',
                    color: '#e74c3c',
                    fontWeight: 'normal',
                    display: 'block',
                    marginTop: '4px',
                  }}
                >
                  ⚠️ Esta carrera tiene fecha de baja programada
                </span>
              )}
            </h3>
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
            <div style={{ marginTop: 8 }}>
              <label>Fecha de baja (opcional)</label>
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}
              >
                <input
                  type='date'
                  value={fechaFin === 'NULL' ? '' : fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  style={{
                    flex: 1,
                    padding: 8,
                    marginTop: 6,
                    backgroundColor: fechaFin === 'NULL' ? '#f8f9fa' : 'white',
                  }}
                  placeholder='Seleccionar fecha de baja'
                />
                <Button
                  variant='outline'
                  onClick={() => setFechaFin('NULL')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    height: 'fit-content',
                    marginTop: 6,
                  }}
                >
                  Cancelar baja
                </Button>
              </div>
              <small
                style={{
                  color: '#666',
                  fontSize: '12px',
                  marginTop: 4,
                  display: 'block',
                }}
              >
                {fechaFin === 'NULL' ? (
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                    ✓ Baja cancelada - La carrera volverá a estar activa
                  </span>
                ) : (
                  <>
                    Si se especifica una fecha, la carrera se marcará como
                    inactiva desde esa fecha.
                    {fechaFin && fechaFin !== 'NULL' && (
                      <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                        {' '}
                        Usa "Cancelar baja" para reactivar la carrera.
                      </span>
                    )}
                  </>
                )}
              </small>
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
