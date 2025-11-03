import React from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import styles from './UserStatesPage.module.css';
import { Input } from '../../components/ui/Input';
import {
  listUserStates,
  createUserState,
  updateUserState,
  deactivateUserState,
} from '../../services/admin';

type StateItem = {
  id: number | string;
  nombre: string;
  activo?: boolean;
  fechaFin?: string | null;
};

export default function UserStatesPage() {
  const [items, setItems] = React.useState<StateItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<StateItem | null>(null);
  const [name, setName] = React.useState('');
  const [fechaFin, setFechaFin] = React.useState<string>('');
  const [activarEstado, setActivarEstado] = React.useState(false);
  const [stateToDelete, setStateToDelete] = React.useState<{
    id: number | string;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [filterNombre, setFilterNombre] = React.useState('');
  const [filterEstado, setFilterEstado] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUserStates({ includeInactive: 1 });
      // service now normalizes fechaFin/activo; accept arrays or wrapped responses
      const toObj = (v: unknown): Record<string, unknown> =>
        v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
      if (Array.isArray(data)) {
        setItems(data as StateItem[]);
      } else {
        const o = toObj(data);
        if (Array.isArray(o['userStatuses']))
          setItems(o['userStatuses'] as StateItem[]);
        else if (Array.isArray(o['userStates']))
          setItems(o['userStates'] as StateItem[]);
        else setItems([]);
      }
    } catch {
      setError('No se pudieron cargar los estados');
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
    setActivarEstado(false);
    setShowModal(true);
  };

  const openEdit = (it: StateItem) => {
    setEditing(it);
    setName(it.nombre || '');
    // Formatear fecha si existe
    if (it.fechaFin) {
      try {
        const date = new Date(it.fechaFin);
        const formatted = date.toISOString().split('T')[0];
        setFechaFin(formatted);
        setActivarEstado(false);
      } catch {
        setFechaFin('');
        setActivarEstado(false);
      }
    } else {
      setFechaFin('');
      setActivarEstado(true);
    }
    setShowModal(true);
  };

  const save = async () => {
    setError(null);
    try {
      if (editing) {
        // Preparar payload con fechaFin
        const payload: {
          nombreEstadoUsuario: string;
          fechaFin?: string | null;
        } = {
          nombreEstadoUsuario: name,
        };

        // Si activarEstado está marcado, enviar fechaFin como null
        if (activarEstado) {
          payload.fechaFin = null;
        } else if (fechaFin) {
          // Si hay una fecha seleccionada, enviarla
          payload.fechaFin = fechaFin;
        }

        await updateUserState(editing.id, payload);
      } else {
        await createUserState({ nombreEstadoUsuario: name });
      }
      setShowModal(false);
      load();
    } catch {
      setError('Error al guardar');
    }
  };

  const confirmDelete = (id: number | string, nombre: string) => {
    setStateToDelete({ id, nombre });
  };

  const remove = async () => {
    if (!stateToDelete) return;

    setError(null);
    setDeleting(true);
    try {
      await deactivateUserState(stateToDelete.id, stateToDelete.nombre);
      setStateToDelete(null);
      load();
    } catch {
      setError('No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  // Función para filtrar estados
  const filteredItems = React.useMemo(() => {
    return items.filter(it => {
      const matchNombre =
        !filterNombre ||
        it.nombre?.toLowerCase().includes(filterNombre.toLowerCase());

      // Calcular estado
      const rec = it as unknown as Record<string, unknown>;
      const f =
        rec['fechaFin'] ??
        rec['fecha_fin'] ??
        rec['fechaBaja'] ??
        rec['fecha_baja'] ??
        rec['fechaHasta'] ??
        rec['fecha_hasta'] ??
        rec['endDate'] ??
        rec['end_date'] ??
        null;
      let estado = 'Activo';
      if (f && String(f).trim() !== '') {
        estado = 'Baja';
      } else if (it.activo === false) {
        estado = 'Inactivo';
      }

      const matchEstado =
        !filterEstado ||
        estado.toLowerCase().includes(filterEstado.toLowerCase());

      return matchNombre && matchEstado;
    });
  }, [items, filterNombre, filterEstado]);

  const clearFilters = () => {
    setFilterNombre('');
    setFilterEstado('');
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Estados de Usuario</h1>
        <Button onClick={openCreate}>+ Agregar Estado</Button>
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
          {(filterNombre || filterEstado) && (
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(it => (
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
                      rec['fechaHasta'] ??
                      rec['fecha_hasta'] ??
                      rec['endDate'] ??
                      rec['end_date'] ??
                      null;
                    if (f && String(f).trim() !== '') return 'Baja';
                    return it.activo ? 'Activo' : 'Inactivo';
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
            <h3>{editing ? `Editar Estado` : `Agregar Estado`}</h3>
            <Input
              label='Nombre de Estado'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
            />

            {editing && (
              <>
                <div style={{ marginTop: '16px', marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type='checkbox'
                      checked={activarEstado}
                      onChange={e => {
                        setActivarEstado(e.target.checked);
                        if (e.target.checked) {
                          setFechaFin('');
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    ✅ Reactivar estado (quitar fecha de fin)
                  </label>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px',
                      marginLeft: '24px',
                    }}
                  >
                    Marca esta opción para volver a activar el estado
                    estableciendo fechaFin como null
                  </div>
                </div>

                {!activarEstado && (
                  <div style={{ marginTop: '12px' }}>
                    <Input
                      label='Fecha de Fin (opcional)'
                      type='date'
                      fullWidth
                      value={fechaFin}
                      onChange={e => setFechaFin(e.target.value)}
                      helperText='Si se establece una fecha de fin, el estado se considerará inactivo'
                      min={new Date().toISOString().split('T')[0]}
                    />
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
                          es anterior a hoy. El estado se marcará como
                          "Inactivo" inmediatamente.
                        </div>
                      )}
                  </div>
                )}

                {editing.fechaFin && !activarEstado && !fechaFin && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: '#fff3cd',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#856404',
                    }}
                  >
                    ⚠️ Este estado actualmente tiene fecha de fin:{' '}
                    {new Date(editing.fechaFin).toLocaleDateString()}
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
        isOpen={!!stateToDelete}
        onClose={() => setStateToDelete(null)}
        onConfirm={remove}
        title='Confirmar Eliminación de Estado'
        message={
          <>
            <p>
              ¿Estás seguro de que deseas eliminar el estado{' '}
              <strong>"{stateToDelete?.nombre}"</strong>?
            </p>
            <p>Esta acción afectará a todos los usuarios con este estado.</p>
          </>
        }
        confirmText='Sí, Eliminar Estado'
        cancelText='Cancelar'
        variant='danger'
        isLoading={deleting}
      />
    </div>
  );
}
