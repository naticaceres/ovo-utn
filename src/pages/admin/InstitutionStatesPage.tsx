import React from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import styles from './AdminCrud.module.css';
import {
  listInstitutionStates,
  createInstitutionState,
  updateInstitutionState,
  deactivateInstitutionState,
} from '../../services/admin';

type Item = {
  id: number | string;
  nombre: string;
  activo?: boolean;
  fechaFin?: string | null;
};

export default function InstitutionStatesPage() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [name, setName] = React.useState('');
  const [fechaFin, setFechaFin] = React.useState<string>('');
  const [reactivar, setReactivar] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<{
    id: number | string;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [filterNombre, setFilterNombre] = React.useState('');
  const [filterEstado, setFilterEstado] = React.useState('');
  const [filterFechaFin, setFilterFechaFin] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listInstitutionStates();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar los estados de institución');
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
    setFechaFin('');
    setReactivar(false);
    setShowModal(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setName(it.nombre || '');

    if (it.fechaFin && it.fechaFin !== 'NULL' && it.fechaFin.trim() !== '') {
      try {
        const date = new Date(it.fechaFin);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          setFechaFin(`${year}-${month}-${day}`);
        } else {
          setFechaFin('');
        }
      } catch {
        setFechaFin('');
      }
      setReactivar(false);
    } else {
      setFechaFin('');
      setReactivar(false);
    }

    setShowModal(true);
  };

  const save = async () => {
    setError(null);
    try {
      const payload: { nombre: string; fechaFin?: string | null } = {
        nombre: name,
      };

      if (editing) {
        if (reactivar) {
          payload.fechaFin = null;
        } else if (fechaFin) {
          payload.fechaFin = fechaFin;
        }
      }

      if (editing) {
        await updateInstitutionState(editing.id, payload);
      } else {
        await createInstitutionState({ nombre: name });
      }
      setShowModal(false);
      load();
    } catch {
      setError('Error al guardar');
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
      await deactivateInstitutionState(itemToDelete.id, itemToDelete.nombre);
      setItemToDelete(null);
      load();
    } catch {
      setError('No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = React.useMemo(() => {
    return items.filter(it => {
      const matchNombre =
        !filterNombre ||
        it.nombre?.toLowerCase().includes(filterNombre.toLowerCase());

      const fechaFin = it.fechaFin;
      let estado = 'Activo';
      let fechaFinDisplay = '-';

      if (fechaFin && fechaFin.trim() !== '' && fechaFin !== 'NULL') {
        try {
          const endDate = new Date(fechaFin);
          const now = new Date();

          if (!isNaN(endDate.getTime())) {
            const year = endDate.getFullYear();
            const month = String(endDate.getMonth() + 1).padStart(2, '0');
            const day = String(endDate.getDate()).padStart(2, '0');
            fechaFinDisplay = `${year}-${month}-${day}`;

            if (endDate <= now) {
              estado = 'Baja';
            } else {
              estado = 'Programada baja';
            }
          }
        } catch {
          // Error al parsear fecha
        }
      } else if (it.activo === false) {
        estado = 'Inactivo';
      }

      const matchEstado =
        !filterEstado ||
        estado.toLowerCase().includes(filterEstado.toLowerCase());

      const matchFechaFin =
        !filterFechaFin || fechaFinDisplay.includes(filterFechaFin);

      return matchNombre && matchEstado && matchFechaFin;
    });
  }, [items, filterNombre, filterEstado, filterFechaFin]);

  const clearFilters = () => {
    setFilterNombre('');
    setFilterEstado('');
    setFilterFechaFin('');
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Estado de Institución</h1>
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
          {(filterNombre || filterEstado || filterFechaFin) && (
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
            label='Estado'
            placeholder='Buscar por estado...'
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            fullWidth
          />
          <Input
            label='Fecha Fin'
            placeholder='Buscar por fecha...'
            value={filterFechaFin}
            onChange={e => setFilterFechaFin(e.target.value)}
            fullWidth
          />
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Mostrando <strong>{filteredItems.length}</strong> de{' '}
          <strong>{items.length}</strong> estados
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
              <th>Estado</th>
              <th>Fecha Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(it => {
              const fechaFin = it.fechaFin;
              let estado = 'Activo';
              let fechaFinDisplay = '-';

              if (fechaFin && fechaFin.trim() !== '' && fechaFin !== 'NULL') {
                try {
                  const endDate = new Date(fechaFin);
                  const now = new Date();

                  if (!isNaN(endDate.getTime())) {
                    const year = endDate.getFullYear();
                    const month = String(endDate.getMonth() + 1).padStart(
                      2,
                      '0'
                    );
                    const day = String(endDate.getDate()).padStart(2, '0');
                    fechaFinDisplay = `${year}-${month}-${day}`;

                    if (endDate <= now) {
                      estado = 'Baja';
                    } else {
                      estado = 'Programada baja';
                    }
                  }
                } catch {
                  // Error al parsear fecha
                }
              } else if (it.activo === false) {
                estado = 'Inactivo';
              }

              return (
                <tr key={it.id}>
                  <td>{it.nombre}</td>
                  <td>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor:
                          estado === 'Activo'
                            ? '#d4edda'
                            : estado === 'Programada baja'
                              ? '#fff3cd'
                              : '#f8d7da',
                        color:
                          estado === 'Activo'
                            ? '#155724'
                            : estado === 'Programada baja'
                              ? '#856404'
                              : '#721c24',
                      }}
                    >
                      {estado}
                    </span>
                  </td>
                  <td>{fechaFinDisplay}</td>
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
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>
              {editing
                ? 'Editar estado de institución'
                : 'Agregar estado de institución'}
            </h3>
            <Input
              label='Nombre'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Ingrese nombre del estado'
            />

            {editing && (
              <>
                <div style={{ marginTop: '16px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <input
                      type='checkbox'
                      checked={reactivar}
                      onChange={e => {
                        setReactivar(e.target.checked);
                        if (e.target.checked) {
                          setFechaFin('');
                        }
                      }}
                    />
                    <span>
                      Reactivar estado (establecer fecha fin como null)
                    </span>
                  </label>
                </div>

                {!reactivar && (
                  <div style={{ marginTop: '16px' }}>
                    <Input
                      label='Fecha Fin (opcional)'
                      type='date'
                      fullWidth
                      value={fechaFin}
                      onChange={e => setFechaFin(e.target.value)}
                      placeholder='Seleccione fecha de baja'
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <small
                      style={{
                        display: 'block',
                        marginTop: '4px',
                        color: '#666',
                      }}
                    >
                      Dejar vacío para mantener sin cambios. Seleccionar una
                      fecha para programar baja.
                    </small>
                    {fechaFin &&
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
                          <strong>⚠️ Advertencia:</strong> La fecha seleccionada
                          es anterior a hoy. El estado se marcará como "Baja"
                          inmediatamente.
                        </div>
                      )}
                  </div>
                )}

                {fechaFin &&
                  !reactivar &&
                  new Date(fechaFin) >=
                    new Date(new Date().setHours(0, 0, 0, 0)) && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '4px',
                      }}
                    >
                      <strong>⚠️ Nota:</strong> Al establecer una fecha fin, el
                      estado quedará inactivo después de esa fecha.
                    </div>
                  )}

                {reactivar && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#d1ecf1',
                      borderRadius: '4px',
                    }}
                  >
                    <strong>ℹ️ Nota:</strong> Al reactivar, se eliminará la
                    fecha fin y el estado quedará activo nuevamente.
                  </div>
                )}
              </>
            )}

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
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={remove}
        title='Confirmar Eliminación de Estado'
        message={
          <>
            <p>
              ¿Estás seguro de que deseas eliminar el estado{' '}
              <strong>"{itemToDelete?.nombre}"</strong>?
            </p>
            <p>
              Esta acción afectará a todas las instituciones que usen este
              estado.
            </p>
          </>
        }
        confirmText='Sí, Eliminar'
        cancelText='Cancelar'
        variant='danger'
        isLoading={deleting}
      />
    </div>
  );
}
