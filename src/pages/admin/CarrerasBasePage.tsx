import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
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
  const [careerToDelete, setCareerToDelete] = React.useState<{
    id: number | string;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Estados para filtros
  const [filterNombre, setFilterNombre] = React.useState('');
  const [filterTipo, setFilterTipo] = React.useState('');
  const [filterEstado, setFilterEstado] = React.useState('');

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

    // Handle fechaFin: if it's "NULL", null, or empty, set to empty string for the date input
    if (it.fechaFin && it.fechaFin !== 'NULL' && it.fechaFin.trim() !== '') {
      // Convert from "YYYY-MM-DD HH:MM:SS" to "YYYY-MM-DD" format for date input
      const dateOnly = it.fechaFin.split(' ')[0]; // Extract date part before space
      setFechaFin(dateOnly);
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

  const confirmDelete = (id: number | string, nombre: string) => {
    setCareerToDelete({ id, nombre });
  };

  const remove = async () => {
    if (!careerToDelete) return;

    setError(null);
    setDeleting(true);
    try {
      await deactivateCareerBase(
        careerToDelete.id,
        careerToDelete.nombre,
        token || undefined
      );
      setCareerToDelete(null);
      load();
    } catch {
      setError('No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  // Función para filtrar carreras
  const filteredItems = React.useMemo(() => {
    return items.filter(it => {
      // Filtro por nombre
      const matchNombre =
        !filterNombre ||
        it.nombre?.toLowerCase().includes(filterNombre.toLowerCase());

      // Filtro por tipo
      const tipoNombre =
        types.find(t => t.id === it.idTipoCarrera)?.nombre || '';
      const matchTipo =
        !filterTipo ||
        tipoNombre.toLowerCase().includes(filterTipo.toLowerCase());

      // Filtro por estado
      const fechaFin = it.fechaFin;
      let estado = 'Activo';
      if (fechaFin && fechaFin.trim() !== '' && fechaFin !== 'NULL') {
        const endDate = new Date(fechaFin);
        const now = new Date();
        if (endDate <= now) {
          estado = 'Baja';
        } else {
          estado = 'Programada baja';
        }
      } else if (it.activo === false) {
        estado = 'Inactivo';
      }

      const matchEstado =
        !filterEstado ||
        estado.toLowerCase().includes(filterEstado.toLowerCase());

      return matchNombre && matchTipo && matchEstado;
    });
  }, [items, types, filterNombre, filterTipo, filterEstado]);

  const clearFilters = () => {
    setFilterNombre('');
    setFilterTipo('');
    setFilterEstado('');
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Carreras</h1>
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
          {(filterNombre || filterTipo || filterEstado) && (
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
          <Input
            label='Tipo'
            placeholder='Buscar por tipo...'
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value)}
            fullWidth
          />
          <Input
            label='Estado'
            placeholder='Buscar por estado...'
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            fullWidth
          />
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Mostrando <strong>{filteredItems.length}</strong> de{' '}
          <strong>{items.length}</strong> carreras
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
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(it => (
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
                  min={new Date().toISOString().split('T')[0]}
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
              {fechaFin &&
                fechaFin !== 'NULL' &&
                new Date(fechaFin) <
                  new Date(new Date().setHours(0, 0, 0, 0)) && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: '#f8d7da',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#721c24',
                    }}
                  >
                    <strong>⚠️ Advertencia:</strong> La fecha seleccionada es
                    anterior a hoy. La carrera se marcará como "Baja"
                    inmediatamente.
                  </div>
                )}
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

      <ConfirmDialog
        isOpen={!!careerToDelete}
        onClose={() => setCareerToDelete(null)}
        onConfirm={remove}
        title='Confirmar Eliminación de Carrera'
        message={
          <>
            <p>
              ¿Estás seguro de que deseas eliminar la carrera{' '}
              <strong>"{careerToDelete?.nombre}"</strong>?
            </p>
            <p>
              Esta acción desactivará la carrera y no estará disponible en el
              sistema.
            </p>
          </>
        }
        confirmText='Sí, Eliminar Carrera'
        cancelText='Cancelar'
        variant='danger'
        isLoading={deleting}
      />
    </div>
  );
}
