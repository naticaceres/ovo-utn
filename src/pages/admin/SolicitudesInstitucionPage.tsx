import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import styles from './SolicitudesInstitucionPage.module.css';
import {
  listInstitutionRequests,
  approveInstitutionRequest,
  rejectInstitutionRequest,
  listInstitutionTypes,
  deactivateInstitution,
  activateInstitution,
  getInstitutionStateHistory,
  changeInstitutionAdmin,
  listUsers,
  type InstitutionStateHistoryDTO,
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
  idUsuario?: number | null;
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
  const [activatingId, setActivatingId] = React.useState<
    number | string | null
  >(null);
  const [institutionToDelete, setInstitutionToDelete] = React.useState<{
    id: number | string;
    nombre: string;
  } | null>(null);

  // Estados para el modal de historial
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [stateHistory, setStateHistory] = React.useState<
    InstitutionStateHistoryDTO[]
  >([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const [selectedInstitutionForHistory, setSelectedInstitutionForHistory] =
    React.useState<{
      id: number | string;
      nombre: string;
    } | null>(null);

  // Estados para el modal de cambio de administrador
  const [showChangeAdminModal, setShowChangeAdminModal] = React.useState(false);
  const [selectedInstitutionForAdmin, setSelectedInstitutionForAdmin] =
    React.useState<{
      id: number | string;
      nombre: string;
      idUsuarioActual: number | null;
    } | null>(null);
  const [currentAdminUser, setCurrentAdminUser] = React.useState<{
    id: number;
    nombre: string;
    apellido: string;
    mail: string;
  } | null>(null);
  const [users, setUsers] = React.useState<
    Array<{
      id: number;
      nombre: string;
      apellido: string;
      mail: string;
      grupos: string[];
    }>
  >([]);
  const [filteredUsers, setFilteredUsers] = React.useState<
    Array<{
      id: number;
      nombre: string;
      apellido: string;
      mail: string;
      grupos: string[];
    }>
  >([]);
  const [userSearchTerm, setUserSearchTerm] = React.useState('');
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(
    null
  );
  const [changingAdmin, setChangingAdmin] = React.useState(false);

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
    setError(null);
    setApprovingId(id);
    try {
      const token = localStorage.getItem('token');
      await approveInstitutionRequest(id, token || undefined);
      loadData(); // Recargar la lista
    } catch (err) {
      console.error('Error approving institution request:', err);
      setError('No se pudo aprobar la solicitud');
    } finally {
      setApprovingId(null);
    }
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

  const cancelReject = () => {
    setShowRejectModal(false);
    setRejectingId(null);
    setJustificacion('');
    setConfirmingRejectId(null);
  };

  const confirmDeactivate = (id: number | string, nombre: string) => {
    setInstitutionToDelete({ id, nombre });
  };

  const onDeactivate = async () => {
    if (!institutionToDelete) return;

    setError(null);
    setDeactivatingId(institutionToDelete.id);
    try {
      const token = localStorage.getItem('token');
      await deactivateInstitution(institutionToDelete.id, token || undefined);
      setInstitutionToDelete(null);
      loadData(); // Recargar la lista
    } catch (err) {
      console.error('Error deactivating institution:', err);
      setError('No se pudo dar de baja la institución');
    } finally {
      setDeactivatingId(null);
    }
  };

  const onActivate = async (id: number | string) => {
    setError(null);
    setActivatingId(id);
    try {
      const token = localStorage.getItem('token');
      await activateInstitution(id, token || undefined);
      loadData(); // Recargar la lista
    } catch (err) {
      console.error('Error activating institution:', err);
      setError('No se pudo reactivar la institución');
    } finally {
      setActivatingId(null);
    }
  };

  const openHistoryModal = async (
    institutionId: number | string,
    institutionName: string
  ) => {
    setSelectedInstitutionForHistory({
      id: institutionId,
      nombre: institutionName,
    });
    setShowHistoryModal(true);
    setLoadingHistory(true);
    setStateHistory([]);

    try {
      const token = localStorage.getItem('token');
      const history = await getInstitutionStateHistory(
        institutionId,
        token || undefined
      );
      setStateHistory(history);
    } catch (err) {
      console.error('Error loading institution state history:', err);
      setError('No se pudo cargar el historial de estados');
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedInstitutionForHistory(null);
    setStateHistory([]);
  };

  const openChangeAdminModal = async (
    institutionId: number | string,
    institutionName: string,
    currentUserId: number | null
  ) => {
    setSelectedInstitutionForAdmin({
      id: institutionId,
      nombre: institutionName,
      idUsuarioActual: currentUserId,
    });
    setShowChangeAdminModal(true);
    setLoadingUsers(true);
    setUsers([]);
    setFilteredUsers([]);
    setUserSearchTerm('');
    setSelectedUserId(null);
    setCurrentAdminUser(null);

    try {
      const token = localStorage.getItem('token');
      const usersData = await listUsers(token || undefined);
      // Normalizar la respuesta
      const normalizedUsers = (Array.isArray(usersData) ? usersData : []).map(
        (u: {
          id: number | string;
          nombre?: string;
          apellido?: string;
          mail?: string;
          email?: string;
          grupos?: string[];
        }) => ({
          id: Number(u.id),
          nombre: u.nombre || '',
          apellido: u.apellido || '',
          mail: u.mail || u.email || '',
          grupos: u.grupos || [],
        })
      );
      setUsers(normalizedUsers);
      setFilteredUsers(normalizedUsers);

      // Buscar y establecer el usuario actual si existe
      if (currentUserId) {
        const currentUser = normalizedUsers.find(u => u.id === currentUserId);
        if (currentUser) {
          setCurrentAdminUser(currentUser);
          setSelectedUserId(currentUserId);
        }
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('No se pudo cargar la lista de usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  const closeChangeAdminModal = () => {
    setShowChangeAdminModal(false);
    setSelectedInstitutionForAdmin(null);
    setUsers([]);
    setFilteredUsers([]);
    setUserSearchTerm('');
    setSelectedUserId(null);
    setCurrentAdminUser(null);
  };

  const handleUserSearch = (searchTerm: string) => {
    setUserSearchTerm(searchTerm);
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = users.filter(user => {
      const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
      const email = user.mail.toLowerCase();
      return fullName.includes(term) || email.includes(term);
    });
    setFilteredUsers(filtered);
  };

  const confirmChangeAdmin = async () => {
    if (!selectedInstitutionForAdmin || !selectedUserId) return;

    setError(null);
    setChangingAdmin(true);
    try {
      const token = localStorage.getItem('token');
      await changeInstitutionAdmin(
        selectedInstitutionForAdmin.id,
        selectedUserId,
        token || undefined
      );
      closeChangeAdminModal();
      loadData(); // Recargar la lista
    } catch (err) {
      console.error('Error changing institution admin:', err);
      setError('No se pudo cambiar el usuario administrador de la institución');
    } finally {
      setChangingAdmin(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Actualidad';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
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
            deactivatingId !== null ||
            activatingId !== null
          }
        />
        <Input
          placeholder='Buscar por email'
          value={filters.email}
          onChange={e => setFilters({ ...filters, email: e.target.value })}
          disabled={
            approvingId !== null ||
            confirmingRejectId !== null ||
            deactivatingId !== null ||
            activatingId !== null
          }
        />
        <select
          value={filters.estado}
          onChange={e => setFilters({ ...filters, estado: e.target.value })}
          disabled={
            approvingId !== null ||
            confirmingRejectId !== null ||
            deactivatingId !== null ||
            activatingId !== null
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
            deactivatingId !== null ||
            activatingId !== null
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
                    <Button
                      variant='outline'
                      onClick={() =>
                        openHistoryModal(it.id, it.nombre || 'Institución')
                      }
                      title='Ver historial de estados'
                    >
                      👁️
                    </Button>
                    {(it.estado === 'Aprobada' ||
                      it.estado === 'Pendiente') && (
                      <Button
                        variant='outline'
                        onClick={() =>
                          openChangeAdminModal(
                            it.id,
                            it.nombre || 'Institución',
                            it.idUsuario || null
                          )
                        }
                        title='Cambiar usuario administrador'
                        disabled={
                          approvingId !== null ||
                          confirmingRejectId !== null ||
                          deactivatingId !== null ||
                          activatingId !== null
                        }
                      >
                        👤
                      </Button>
                    )}
                    {it.estado === 'Pendiente' && (
                      <>
                        <Button
                          onClick={() => onApprove(it.id)}
                          style={{ background: '#28a745', color: 'white' }}
                          disabled={
                            approvingId === it.id ||
                            confirmingRejectId === it.id ||
                            deactivatingId === it.id ||
                            activatingId === it.id
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
                            deactivatingId === it.id ||
                            activatingId === it.id
                          }
                        >
                          Rechazar
                        </Button>
                      </>
                    )}
                    {it.estado === 'Aprobada' && (
                      <Button
                        onClick={() =>
                          confirmDeactivate(
                            it.id,
                            it.nombre || 'esta institución'
                          )
                        }
                        style={{ background: '#dc3545', color: 'white' }}
                        disabled={
                          approvingId !== null ||
                          confirmingRejectId !== null ||
                          deactivatingId === it.id ||
                          activatingId !== null
                        }
                        isLoading={deactivatingId === it.id}
                      >
                        {deactivatingId === it.id
                          ? 'Dando de baja...'
                          : 'Dar de baja'}
                      </Button>
                    )}
                    {it.estado === 'Rechazada' && (
                      <span style={{ color: '#666', fontSize: '12px' }}>
                        Rechazada
                      </span>
                    )}
                    {(it.estado === 'Baja' ||
                      it.estado === 'Inactiva' ||
                      it.estado === 'Desactivada') && (
                      <Button
                        onClick={() => onActivate(it.id)}
                        style={{ background: '#17a2b8', color: 'white' }}
                        disabled={
                          approvingId !== null ||
                          confirmingRejectId !== null ||
                          deactivatingId !== null ||
                          activatingId === it.id
                        }
                        isLoading={activatingId === it.id}
                      >
                        {activatingId === it.id
                          ? 'Reactivando...'
                          : 'Reactivar'}
                      </Button>
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

      <ConfirmDialog
        isOpen={!!institutionToDelete}
        onClose={() => setInstitutionToDelete(null)}
        onConfirm={onDeactivate}
        title='Confirmar Baja de Institución'
        message={
          <>
            <p>
              ¿Estás seguro de que deseas dar de baja a{' '}
              <strong>"{institutionToDelete?.nombre}"</strong>?
            </p>
            <p style={{ color: '#dc2626', fontWeight: 600 }}>
              ⚠️ Esta acción desactivará la institución y no se puede deshacer.
            </p>
            <p>
              La institución dejará de estar visible en el sistema y no podrá
              gestionar carreras.
            </p>
          </>
        }
        confirmText='Sí, Dar de Baja'
        cancelText='Cancelar'
        variant='danger'
        isLoading={deactivatingId === institutionToDelete?.id}
      />

      {/* Modal de Historial de Estados de Institución */}
      {showHistoryModal && (
        <div className={styles.modalBackdrop}>
          <div
            className={styles.modal}
            style={{ maxWidth: '900px', width: '90%' }}
          >
            <h3>
              Historial de Estados -{' '}
              {selectedInstitutionForHistory?.nombre || 'Institución'}
            </h3>

            {loadingHistory ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                Cargando historial...
              </div>
            ) : error && stateHistory.length === 0 ? (
              <div className={styles.error}>{error}</div>
            ) : stateHistory.length === 0 ? (
              <div
                style={{ padding: '20px', textAlign: 'center', color: '#666' }}
              >
                No se encontró historial de estados para esta institución.
              </div>
            ) : (
              <div
                style={{
                  maxHeight: '500px',
                  overflowY: 'auto',
                  marginTop: '16px',
                }}
              >
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Fin</th>
                      <th>Duración</th>
                      <th>Justificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateHistory.map((item, idx) => {
                      const esActual = !item.fechaFin;
                      return (
                        <tr
                          key={idx}
                          style={{
                            backgroundColor: esActual
                              ? '#f0f9ff'
                              : 'transparent',
                            fontWeight: esActual ? 600 : 400,
                          }}
                        >
                          <td>
                            {item.nombreEstadoInstitucion}
                            {esActual && (
                              <span
                                style={{
                                  marginLeft: '8px',
                                  padding: '2px 8px',
                                  backgroundColor: '#22c55e',
                                  color: 'white',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                }}
                              >
                                Actual
                              </span>
                            )}
                          </td>
                          <td>{formatDate(item.fechaInicio)}</td>
                          <td>{formatDate(item.fechaFin)}</td>
                          <td>
                            {(() => {
                              try {
                                const inicio = new Date(item.fechaInicio);
                                const fin = item.fechaFin
                                  ? new Date(item.fechaFin)
                                  : new Date();
                                const diffMs = fin.getTime() - inicio.getTime();
                                const diffDays = Math.floor(
                                  diffMs / (1000 * 60 * 60 * 24)
                                );

                                if (diffDays === 0) return 'Menos de 1 día';
                                if (diffDays === 1) return '1 día';
                                if (diffDays < 30) return `${diffDays} días`;
                                if (diffDays < 365) {
                                  const meses = Math.floor(diffDays / 30);
                                  return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
                                }
                                const años = Math.floor(diffDays / 365);
                                return `${años} ${años === 1 ? 'año' : 'años'}`;
                              } catch {
                                return 'N/A';
                              }
                            })()}
                          </td>
                          <td>
                            {item.justificacion ? (
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
                                title={item.justificacion}
                              >
                                {item.justificacion.length > 50
                                  ? `${item.justificacion.substring(0, 50)}...`
                                  : item.justificacion}
                              </span>
                            ) : (
                              <span style={{ color: '#999', fontSize: '12px' }}>
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className={styles.modalActions} style={{ marginTop: '20px' }}>
              <Button onClick={closeHistoryModal}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cambio de Administrador */}
      {showChangeAdminModal && (
        <div className={styles.modalBackdrop}>
          <div
            className={styles.modal}
            style={{ maxWidth: '800px', width: '90%' }}
          >
            <h3>
              Cambiar Usuario Administrador -{' '}
              {selectedInstitutionForAdmin?.nombre || 'Institución'}
            </h3>

            {/* Mostrar usuario actual */}
            {currentAdminUser ? (
              <div
                style={{
                  marginTop: '16px',
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px',
                  border: '1px solid #2196f3',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#1976d2',
                  }}
                >
                  👤 Usuario Actual:
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                  <span>
                    <strong>Nombre:</strong> {currentAdminUser.nombre}{' '}
                    {currentAdminUser.apellido}
                  </span>
                  <span>
                    <strong>Email:</strong> {currentAdminUser.mail}
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginTop: '16px',
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '4px',
                  border: '1px solid #ffc107',
                  color: '#856404',
                }}
              >
                ⚠️ Esta institución no tiene un usuario administrador asignado
                actualmente
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <Input
                placeholder='Buscar usuario por nombre o email...'
                value={userSearchTerm}
                onChange={e => handleUserSearch(e.target.value)}
                disabled={loadingUsers || changingAdmin}
              />
            </div>

            {loadingUsers ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                Cargando usuarios...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div
                style={{ padding: '20px', textAlign: 'center', color: '#666' }}
              >
                {userSearchTerm.trim()
                  ? 'No se encontraron usuarios que coincidan con la búsqueda'
                  : 'No se encontraron usuarios'}
              </div>
            ) : (
              <div
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid #e6e6e6',
                  borderRadius: '4px',
                }}
              >
                <table className={styles.table} style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>Seleccionar</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Grupos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr
                        key={user.id}
                        style={{
                          backgroundColor:
                            selectedUserId === user.id
                              ? '#e3f2fd'
                              : 'transparent',
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type='radio'
                            name='selectedUser'
                            checked={selectedUserId === user.id}
                            onChange={() => setSelectedUserId(user.id)}
                            disabled={changingAdmin}
                          />
                        </td>
                        <td>
                          {user.nombre} {user.apellido}
                          {currentAdminUser &&
                            user.id === currentAdminUser.id && (
                              <span
                                style={{
                                  marginLeft: '8px',
                                  padding: '2px 6px',
                                  backgroundColor: '#2196f3',
                                  color: 'white',
                                  borderRadius: '3px',
                                  fontSize: '11px',
                                }}
                              >
                                Actual
                              </span>
                            )}
                        </td>
                        <td>{user.mail}</td>
                        <td>
                          {user.grupos.length > 0 ? (
                            <div
                              style={{
                                display: 'flex',
                                gap: '4px',
                                flexWrap: 'wrap',
                              }}
                            >
                              {user.grupos.map((grupo, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    padding: '2px 6px',
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                  }}
                                >
                                  {grupo}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#999', fontSize: '12px' }}>
                              Sin grupos
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className={styles.modalActions} style={{ marginTop: '20px' }}>
              <Button
                variant='outline'
                onClick={closeChangeAdminModal}
                disabled={changingAdmin}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmChangeAdmin}
                disabled={!selectedUserId || changingAdmin}
                isLoading={changingAdmin}
                style={{ background: '#2563eb', color: 'white' }}
              >
                {changingAdmin ? 'Cambiando...' : 'Confirmar Cambio'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
