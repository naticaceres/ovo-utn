import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import styles from './AdminCrud.module.css';
import {
  listSkills,
  createSkill,
  updateSkill,
  deactivateSkill,
} from '../../services/admin';

type Item = {
  id: number | string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  fechaBaja?: string | null;
};

export default function AptitudesPage() {
  const token = localStorage.getItem('token');
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [fechaBaja, setFechaBaja] = React.useState<string>('');
  const [reactivar, setReactivar] = React.useState(false);
  const [skillToDelete, setSkillToDelete] = React.useState<{
    id: number | string;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [filterNombre, setFilterNombre] = React.useState('');
  const [filterDescripcion, setFilterDescripcion] = React.useState('');
  const [filterEstado, setFilterEstado] = React.useState('');
  const [filterFechaBaja, setFilterFechaBaja] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSkills({}, token || undefined);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar las aptitudes');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setFechaBaja('');
    setReactivar(false);
    setShowModal(true);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setName(item.nombre);
    setDescription(item.descripcion || '');

    if (
      item.fechaBaja &&
      item.fechaBaja !== 'NULL' &&
      item.fechaBaja.trim() !== ''
    ) {
      try {
        const date = new Date(item.fechaBaja);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          setFechaBaja(`${year}-${month}-${day}`);
        } else {
          setFechaBaja('');
        }
      } catch {
        setFechaBaja('');
      }
      setReactivar(false);
    } else {
      setFechaBaja('');
      setReactivar(false);
    }

    setShowModal(true);
  };

  const confirmDelete = (id: number | string, nombre: string) => {
    setSkillToDelete({ id, nombre });
  };

  const remove = async () => {
    if (!skillToDelete) return;

    setError(null);
    setDeleting(true);
    try {
      await deactivateSkill(
        skillToDelete.id,
        skillToDelete.nombre,
        token || undefined
      );
      setSkillToDelete(null);
      await load();
    } catch {
      setError('No se pudo eliminar la aptitud');
    } finally {
      setDeleting(false);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const payload: {
        nombre: string;
        descripcion?: string;
        fechaBaja?: string | null;
      } = {
        nombre: name.trim(),
        descripcion: description.trim() || undefined,
      };

      if (editing) {
        if (reactivar) {
          payload.fechaBaja = null;
        } else if (fechaBaja) {
          payload.fechaBaja = fechaBaja;
        }
      }

      if (editing) {
        await updateSkill(editing.id, payload, token || undefined);
      } else {
        await createSkill(payload, token || undefined);
      }
      setShowModal(false);
      setEditing(null);
      setName('');
      setDescription('');
      setFechaBaja('');
      setReactivar(false);
      setError(null);
      await load();
    } catch {
      setError('No se pudo guardar la aptitud');
    }
  };

  // Función para filtrar aptitudes
  const filteredItems = React.useMemo(() => {
    return items.filter(it => {
      const matchNombre =
        !filterNombre ||
        it.nombre?.toLowerCase().includes(filterNombre.toLowerCase());

      const matchDescripcion =
        !filterDescripcion ||
        it.descripcion?.toLowerCase().includes(filterDescripcion.toLowerCase());

      const fechaBaja = it.fechaBaja;
      let estado = 'Activo';
      let fechaBajaDisplay = '-';

      if (fechaBaja && fechaBaja.trim() !== '' && fechaBaja !== 'NULL') {
        try {
          const endDate = new Date(fechaBaja);
          const now = new Date();

          if (!isNaN(endDate.getTime())) {
            const year = endDate.getFullYear();
            const month = String(endDate.getMonth() + 1).padStart(2, '0');
            const day = String(endDate.getDate()).padStart(2, '0');
            fechaBajaDisplay = `${year}-${month}-${day}`;

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

      const matchFechaBaja =
        !filterFechaBaja || fechaBajaDisplay.includes(filterFechaBaja);

      return matchNombre && matchDescripcion && matchEstado && matchFechaBaja;
    });
  }, [items, filterNombre, filterDescripcion, filterEstado, filterFechaBaja]);

  const clearFilters = () => {
    setFilterNombre('');
    setFilterDescripcion('');
    setFilterEstado('');
    setFilterFechaBaja('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
        <h1>Aptitudes</h1>
        <Button onClick={openCreate}>Agregar aptitud</Button>
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
          {(filterNombre ||
            filterDescripcion ||
            filterEstado ||
            filterFechaBaja) && (
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
            label='Descripción'
            placeholder='Buscar por descripción...'
            value={filterDescripcion}
            onChange={e => setFilterDescripcion(e.target.value)}
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
            label='Fecha Baja'
            placeholder='Buscar por fecha...'
            value={filterFechaBaja}
            onChange={e => setFilterFechaBaja(e.target.value)}
            fullWidth
          />
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Mostrando <strong>{filteredItems.length}</strong> de{' '}
          <strong>{items.length}</strong> aptitudes
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando...</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Fecha Baja</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(it => {
              const fechaBaja = it.fechaBaja;
              let estado = 'Activo';
              let fechaBajaDisplay = '-';

              if (
                fechaBaja &&
                fechaBaja.trim() !== '' &&
                fechaBaja !== 'NULL'
              ) {
                try {
                  const endDate = new Date(fechaBaja);
                  const now = new Date();

                  if (!isNaN(endDate.getTime())) {
                    const year = endDate.getFullYear();
                    const month = String(endDate.getMonth() + 1).padStart(
                      2,
                      '0'
                    );
                    const day = String(endDate.getDate()).padStart(2, '0');
                    fechaBajaDisplay = `${year}-${month}-${day}`;

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
                  <td>{it.descripcion || '-'}</td>
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
                  <td>{fechaBajaDisplay}</td>
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
            <h3>{editing ? `Editar aptitud` : `Agregar aptitud`}</h3>
            <Input
              label='Nombre de la aptitud'
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Ingrese nombre de la aptitud'
            />
            <Input
              label='Descripción (opcional)'
              fullWidth
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Capacidad para...'
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
                          setFechaBaja('');
                        }
                      }}
                    />
                    <span>
                      Reactivar aptitud (establecer fecha baja como null)
                    </span>
                  </label>
                </div>

                {!reactivar && (
                  <div style={{ marginTop: '16px' }}>
                    <Input
                      label='Fecha Baja (opcional)'
                      type='date'
                      fullWidth
                      value={fechaBaja}
                      onChange={e => setFechaBaja(e.target.value)}
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
                    {fechaBaja &&
                      new Date(fechaBaja) <
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
                          es anterior a hoy. La aptitud se marcará como "Baja"
                          inmediatamente.
                        </div>
                      )}
                  </div>
                )}

                {fechaBaja &&
                  !reactivar &&
                  new Date(fechaBaja) >=
                    new Date(new Date().setHours(0, 0, 0, 0)) && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '4px',
                      }}
                    >
                      <strong>⚠️ Nota:</strong> Al establecer una fecha baja, la
                      aptitud quedará inactiva después de esa fecha.
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
                    fecha baja y la aptitud quedará activa nuevamente.
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
        isOpen={!!skillToDelete}
        onClose={() => setSkillToDelete(null)}
        onConfirm={remove}
        title='Confirmar Eliminación de Aptitud'
        message={
          <>
            <p>
              ¿Estás seguro de que deseas eliminar la aptitud{' '}
              <strong>"{skillToDelete?.nombre}"</strong>?
            </p>
            <p>
              Esta acción afectará a todas las preguntas y tests relacionados.
            </p>
          </>
        }
        confirmText='Sí, Eliminar Aptitud'
        cancelText='Cancelar'
        variant='danger'
        isLoading={deleting}
      />
    </div>
  );
}
