import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './SolicitudesInstitucionPage.module.css';
import { api } from '../../context/api';
import {
  listInstitutionRequests,
  approveInstitutionRequest,
  rejectInstitutionRequest,
  listInstitutionTypes,
  deactivateInstitution,
} from '../../services/admin';

type RequestItem = {
  id: number | string;
  nombre?: string;
  tipo?: string;
  tipoId?: number | string;
  localizacion?: string;
  estado?: string;
  email?: string;
  fechaSolicitud?: string;
  justificacion?: string | null;
};

export default function SolicitudesInstitucionPage() {
  const [filters, setFilters] = React.useState({
    nombre: '',
    tipo: '',
    estado: '',
    email: '',
  });
  const [allItems, setAllItems] = React.useState<RequestItem[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<RequestItem[]>([]);
  const [institutionTypes, setInstitutionTypes] = React.useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Estados para el modal de rechazo
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [rejectingId, setRejectingId] = React.useState<number | string | null>(
    null
  );
  const [justificacion, setJustificacion] = React.useState('');

  // Estados para el modal de aprobación
  const [showApproveModal, setShowApproveModal] = React.useState(false);
  const [approvingRequestId, setApprovingRequestId] = React.useState<
    number | string | null
  >(null);
  const [selectedUserId, setSelectedUserId] = React.useState<string>('');
  const [users, setUsers] = React.useState<
    Array<{
      id: number | string;
      nombre: string;
      email?: string;
      grupos?: string[];
      estado?: string;
    }>
  >([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);

  // Estados para bloquear botones durante acciones
  const [approvingId, setApprovingId] = React.useState<number | string | null>(
    null
  );
  const [confirmingRejectId, setConfirmingRejectId] = React.useState<
    number | string | null
  >(null);
  const [deactivatingId, setDeactivatingId] = React.useState<
    number | string | null
  >(null);

  const loadInstitutionTypes = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const types = await listInstitutionTypes({}, token || undefined);
      const typesMap: Record<string, string> = {};
      types.forEach((type: { id: string | number; nombre: string }) => {
        typesMap[type.id] = type.nombre;
      });
      setInstitutionTypes(typesMap);
    } catch (err) {
      console.error('Error loading institution types:', err);
    }
  }, []);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const data = await listInstitutionRequests({}, token || undefined);
      console.log('Institution requests loaded:', data);
      const items = Array.isArray(data) ? (data as RequestItem[]) : [];
      setAllItems(items);
      setFilteredItems(items);
    } catch (err) {
      console.error('Error loading institution requests:', err);
      setError('No se pudieron cargar las solicitudes de instituciones');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cargar usuarios disponibles
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('token');

      // Usar el contexto de API para obtener todos los campos del usuario
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await api.get('/api/v1/admin/users', { headers });

      console.log('Users data received:', data); // Para debug

      // La respuesta es un array directo según el ejemplo proporcionado
      const usersList = Array.isArray(data) ? data : [];

      // Mapear los datos para que coincidan con el tipo esperado
      const mappedUsers = usersList.map(user => ({
        id: user.id,
        nombre: `${user.nombre || ''} ${user.apellido || ''}`.trim(),
        email: user.mail,
        grupos: user.grupos || [],
        estado: user.estado || 'Activo',
      }));

      console.log('Mapped users:', mappedUsers); // Para debug
      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      // Fallback: usar usuarios de ejemplo si no se puede cargar
      setUsers([
        { id: 1, nombre: 'Usuario Administrador', email: 'admin@example.com' },
        {
          id: 2,
          nombre: 'Supervisor General',
          email: 'supervisor@example.com',
        },
      ]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Función para aplicar filtros localmente
  const applyFilters = React.useCallback(() => {
    if (allItems.length === 0) {
      setFilteredItems([]);
      return;
    }

    let filtered = [...allItems];

    // Filtrar por nombre (insensible a mayúsculas/minúsculas y trim)
    if (filters.nombre.trim()) {
      const searchTerm = filters.nombre.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.nombre?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por email (insensible a mayúsculas/minúsculas y trim)
    if (filters.email.trim()) {
      const searchTerm = filters.email.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.email?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por estado (exacto)
    if (filters.estado.trim()) {
      filtered = filtered.filter(item => item.estado === filters.estado);
    }

    setFilteredItems(filtered);
  }, [allItems, filters]);

  // Aplicar filtros cuando cambien los datos o filtros
  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  React.useEffect(() => {
    loadInstitutionTypes();
    loadData();
  }, [loadInstitutionTypes, loadData]);

  const onApprove = async (id: number | string) => {
    setApprovingRequestId(id);
    setSelectedUserId('');
    await fetchUsers();
    setShowApproveModal(true);
  };

  const onReject = (id: number | string) => {
    setRejectingId(id);
    setJustificacion('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectingId || !justificacion.trim()) return;

    setError(null);
    setConfirmingRejectId(rejectingId);
    try {
      const token = localStorage.getItem('token');
      await rejectInstitutionRequest(
        rejectingId,
        justificacion.trim(),
        token || undefined
      );
      loadData(); // Recargar la lista
      setShowRejectModal(false);
      setRejectingId(null);
      setJustificacion('');
    } catch (err) {
      console.error('Error rejecting institution request:', err);
      setError('No se pudo rechazar la solicitud');
    } finally {
      setConfirmingRejectId(null);
    }
  };

  // Confirmar aprobación con usuario seleccionado
  const confirmApprove = async () => {
    if (!selectedUserId || !approvingRequestId) {
      setError('Debe seleccionar una opción');
      return;
    }

    setError(null);
    setApprovingId(approvingRequestId);
    try {
      const token = localStorage.getItem('token');

      // Si se seleccionó "auto", no enviar userId (crear automáticamente)
      if (selectedUserId === 'auto') {
        await approveInstitutionRequest(
          approvingRequestId,
          undefined, // No enviar userId
          token || undefined
        );
      } else {
        await approveInstitutionRequest(
          approvingRequestId,
          selectedUserId,
          token || undefined
        );
      }
      loadData(); // Recargar la lista
      setShowApproveModal(false);
      setApprovingRequestId(null);
      setSelectedUserId('');
    } catch (err) {
      console.error('Error approving institution request:', err);
      setError('No se pudo aprobar la solicitud');
    } finally {
      setApprovingId(null);
    }
  };

  const cancelApprove = () => {
    setShowApproveModal(false);
    setApprovingRequestId(null);
    setSelectedUserId('');
  };

  const cancelReject = () => {
    setShowRejectModal(false);
    setRejectingId(null);
    setJustificacion('');
    setConfirmingRejectId(null);
  };

  const onDeactivate = async (id: number | string) => {
    if (
      !window.confirm(
        '¿Está seguro de que desea dar de baja esta institución? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    setError(null);
    setDeactivatingId(id);
    try {
      const token = localStorage.getItem('token');
      await deactivateInstitution(id, token || undefined);
      loadData(); // Recargar la lista
    } catch (err) {
      console.error('Error deactivating institution:', err);
      setError('No se pudo dar de baja la institución');
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <header className={styles.header}>
        <h1>Solicitudes de Instituciones</h1>
      </header>

      {!loading && allItems.length > 0 && (
        <div className={styles.filterInfo}>
          <span>
            Mostrando {filteredItems.length} de {allItems.length} solicitudes
          </span>
          {filteredItems.length !== allItems.length && (
            <span style={{ fontSize: '12px', fontStyle: 'italic' }}>
              (Filtros aplicados)
            </span>
          )}
        </div>
      )}

      <div className={styles.filters}>
        <Input
          placeholder='Buscar por nombre'
          value={filters.nombre}
          onChange={e => setFilters({ ...filters, nombre: e.target.value })}
          disabled={
            approvingId !== null ||
            confirmingRejectId !== null ||
            deactivatingId !== null
          }
        />
        <Input
          placeholder='Buscar por email'
          value={filters.email}
          onChange={e => setFilters({ ...filters, email: e.target.value })}
          disabled={
            approvingId !== null ||
            confirmingRejectId !== null ||
            deactivatingId !== null
          }
        />
        <select
          value={filters.estado}
          onChange={e => setFilters({ ...filters, estado: e.target.value })}
          disabled={
            approvingId !== null ||
            confirmingRejectId !== null ||
            deactivatingId !== null
          }
          style={{
            padding: '0.5rem',
            border: '1px solid #e6e6e6',
            borderRadius: '4px',
            minWidth: '120px',
          }}
        >
          <option value=''>Todos los estados</option>
          <option value='Pendiente'>Pendiente</option>
          <option value='Aprobada'>Aprobada</option>
          <option value='Rechazada'>Rechazada</option>
          <option value='Baja'>Baja</option>
          <option value='Inactiva'>Inactiva</option>
          <option value='Desactivada'>Desactivada</option>
        </select>
        <Button
          variant='outline'
          onClick={() => {
            setFilters({ nombre: '', tipo: '', estado: '', email: '' });
          }}
          disabled={
            approvingId !== null ||
            confirmingRejectId !== null ||
            deactivatingId !== null
          }
        >
          Limpiar Filtros
        </Button>
      </div>

      {loading ? (
        <div>Cargando solicitudes...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No hay solicitudes de instituciones que coincidan con los filtros
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Localización</th>
              <th>Estado</th>
              <th>Email</th>
              <th>Fecha Solicitud</th>
              <th>Justificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((it: RequestItem) => (
              <tr key={it.id}>
                <td>{it.nombre}</td>
                <td>
                  {it.tipoId
                    ? institutionTypes[it.tipoId] || `Tipo ${it.tipoId}`
                    : it.tipo || 'N/D'}
                </td>
                <td>{it.localizacion}</td>
                <td>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor:
                        it.estado === 'Pendiente'
                          ? '#fff3cd'
                          : it.estado === 'Rechazada' ||
                              it.estado === 'Baja' ||
                              it.estado === 'Inactiva' ||
                              it.estado === 'Desactivada'
                            ? '#f8d7da'
                            : '#d4edda',
                      color:
                        it.estado === 'Pendiente'
                          ? '#856404'
                          : it.estado === 'Rechazada' ||
                              it.estado === 'Baja' ||
                              it.estado === 'Inactiva' ||
                              it.estado === 'Desactivada'
                            ? '#721c24'
                            : '#155724',
                    }}
                  >
                    {it.estado}
                  </span>
                </td>
                <td>{it.email}</td>
                <td>{it.fechaSolicitud}</td>
                <td>
                  {it.justificacion ? (
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#721c24',
                        fontStyle: 'italic',
                        maxWidth: '200px',
                        display: 'block',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                      title={it.justificacion}
                    >
                      {it.justificacion.length > 50
                        ? `${it.justificacion.substring(0, 50)}...`
                        : it.justificacion}
                    </span>
                  ) : (
                    <span style={{ color: '#999', fontSize: '12px' }}>-</span>
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    {it.estado === 'Pendiente' && (
                      <>
                        <Button
                          onClick={() => onApprove(it.id)}
                          style={{ background: '#28a745', color: 'white' }}
                          disabled={
                            approvingId === it.id ||
                            confirmingRejectId === it.id ||
                            deactivatingId === it.id
                          }
                          isLoading={approvingId === it.id}
                        >
                          {approvingId === it.id ? 'Aprobando...' : 'Aprobar'}
                        </Button>
                        <Button
                          onClick={() => onReject(it.id)}
                          style={{ background: '#dc3545', color: 'white' }}
                          disabled={
                            approvingId === it.id ||
                            confirmingRejectId === it.id ||
                            deactivatingId === it.id
                          }
                        >
                          Rechazar
                        </Button>
                      </>
                    )}
                    {it.estado === 'Aprobada' && (
                      <Button
                        onClick={() => onDeactivate(it.id)}
                        style={{ background: '#dc3545', color: 'white' }}
                        disabled={
                          approvingId !== null ||
                          confirmingRejectId !== null ||
                          deactivatingId === it.id
                        }
                        isLoading={deactivatingId === it.id}
                      >
                        {deactivatingId === it.id
                          ? 'Dando de baja...'
                          : 'Dar de baja'}
                      </Button>
                    )}
                    {(it.estado === 'Rechazada' ||
                      it.estado === 'Baja' ||
                      it.estado === 'Inactiva' ||
                      it.estado === 'Desactivada') && (
                      <span style={{ color: '#666', fontSize: '12px' }}>
                        {it.estado === 'Rechazada'
                          ? 'Rechazada'
                          : 'Dada de baja'}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Rechazar Solicitud de Institución</h3>
            <p>Por favor, proporcione una justificación para el rechazo:</p>
            <textarea
              className={styles.textarea}
              value={justificacion}
              onChange={e => setJustificacion(e.target.value)}
              placeholder='Escriba aquí la justificación del rechazo...'
              rows={4}
            />
            <div className={styles.modalActions}>
              <Button
                variant='outline'
                onClick={cancelReject}
                disabled={confirmingRejectId !== null}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmReject}
                disabled={!justificacion.trim() || confirmingRejectId !== null}
                isLoading={confirmingRejectId !== null}
                style={{ background: '#dc3545', color: 'white' }}
              >
                {confirmingRejectId !== null ? 'Rechazando...' : 'Rechazar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de aprobación */}
      {showApproveModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Aprobar Solicitud de Institución</h3>
            <p>
              Seleccione el usuario responsable de manejar esta institución:
            </p>

            {loadingUsers ? (
              <div className={styles.loading}>Cargando usuarios...</div>
            ) : (
              <select
                className={styles.select}
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
              >
                <option value=''>Seleccionar una opción...</option>
                <option value='auto'>
                  CREAR NUEVO USUARIO AUTOMÁTICAMENTE
                </option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nombre} {user.email ? `- ${user.email}` : ''}
                    {user.grupos && user.grupos.length > 0
                      ? ` [${user.grupos.join(', ')}]`
                      : ''}
                  </option>
                ))}
              </select>
            )}

            <div className={styles.modalActions}>
              <Button
                variant='outline'
                onClick={cancelApprove}
                disabled={approvingId !== null}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmApprove}
                disabled={
                  !selectedUserId || approvingId !== null || loadingUsers
                }
                isLoading={approvingId !== null}
                style={{ background: '#28a745', color: 'white' }}
              >
                {approvingId !== null ? 'Aprobando...' : 'Aprobar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
