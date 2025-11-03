import React, { useEffect, useState } from 'react';
import styles from './CareerTypesPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
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
  fechaFin?: string | null;
}

export default function CareerTypesPage() {
  const [items, setItems] = useState<CareerType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CareerType | null>(null);
  const [name, setName] = useState('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [reactivar, setReactivar] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<{
    id: number | string;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterNombre, setFilterNombre] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

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
    setFechaFin('');
    setReactivar(false);
    setShowModal(true);
  };

  const openEdit = (it: CareerType) => {
    setEditing(it);
    setName(it.nombre || '');

    // Cargar fechaFin si existe
    if (it.fechaFin && it.fechaFin !== 'NULL' && it.fechaFin.trim() !== '') {
      const dateOnly = it.fechaFin.split(' ')[0]; // Extraer fecha de "YYYY-MM-DD HH:MM:SS"
      setFechaFin(dateOnly);
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
      const payload: { nombreTipoCarrera: string; fechaFin?: string | null } = {
        nombreTipoCarrera: name,
      };

      // Solo incluir fechaFin si estamos editando
      if (editing) {
        if (reactivar) {
          payload.fechaFin = null; // Reactivar el tipo de carrera
        } else if (fechaFin) {
          payload.fechaFin = fechaFin; // Establecer nueva fecha fin
        }
        // Si no se marca reactivar ni se proporciona fecha, no incluir fechaFin en el payload
      }

      if (editing) {
        await updateCareerType(editing.id, payload);
      } else {
        await createCareerType({ nombreTipoCarrera: name });
      }
      setShowModal(false);
      load();
    } catch {
      setError('Error al guardar');
    }
  };

  const confirmDelete = (id: number | string, nombre: string) => {
    setTypeToDelete({ id, nombre });
  };

  const remove = async () => {
    if (!typeToDelete) return;

    setError(null);
    setDeleting(true);
    try {
      await deactivateCareerType(typeToDelete.id);
      setTypeToDelete(null);
      load();
    } catch {
      setError('No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  // Función para filtrar tipos de carrera
  const filteredItems = React.useMemo(() => {
    return items.filter(it => {
      // Filtro por nombre
      const matchNombre =
        !filterNombre ||
        it.nombre?.toLowerCase().includes(filterNombre.toLowerCase());

      // Filtro por estado
      const rec = it as unknown as Record<string, unknown>;
      const f =
        rec['fechaFin'] ??
        rec['fecha_fin'] ??
        rec['fechaBaja'] ??
        rec['fecha_baja'] ??
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
        <h1>Tipos de Carrera</h1>
        <Button onClick={openCreate}>+ Agregar tipo de carrera</Button>
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
          <strong>{items.length}</strong> tipos de carrera
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
                const endDate = new Date(fechaFin);
                const now = new Date();
                fechaFinDisplay = fechaFin.split(' ')[0]; // Mostrar solo fecha

                if (endDate <= now) {
                  estado = 'Baja';
                } else {
                  estado = 'Programada baja';
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
                    <Button variant='outline' onClick={() => openEdit(it)}>
                      ✏️
                    </Button>
                    <Button onClick={() => confirmDelete(it.id, it.nombre)}>
                      🗑️
                    </Button>
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
              {editing ? 'Editar tipo de carrera' : 'Agregar tipo de carrera'}
            </h3>
            <Input
              label='Nombre'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Ingrese nombre del tipo de carrera'
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
                          setFechaFin(''); // Limpiar fecha si se marca reactivar
                        }
                      }}
                    />
                    <span>
                      Reactivar tipo de carrera (establecer fecha fin como null)
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
                          es anterior a hoy. El tipo de carrera se marcará como
                          "Baja" inmediatamente.
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
                      tipo de carrera quedará inactivo después de esa fecha.
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
                    fecha fin y el tipo de carrera quedará activo nuevamente.
                  </div>
                )}
              </>
            )}

            <div className={styles.modalActions}>
              <Button variant='outline' onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={save}>Guardar</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!typeToDelete}
        onClose={() => setTypeToDelete(null)}
        onConfirm={remove}
        title='Confirmar Eliminación de Tipo de Carrera'
        message={
          <>
            <p>
              ¿Estás seguro de que deseas eliminar el tipo de carrera{' '}
              <strong>"{typeToDelete?.nombre}"</strong>?
            </p>
            <p>Esta acción afectará a todas las carreras de este tipo.</p>
          </>
        }
        confirmText='Sí, Eliminar Tipo'
        cancelText='Cancelar'
        variant='danger'
        isLoading={deleting}
      />
    </div>
  );
}
