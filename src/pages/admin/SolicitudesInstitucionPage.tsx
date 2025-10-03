import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './SolicitudesInstitucionPage.module.css';
import {
  listInstitutionRequests,
  approveInstitutionRequest,
  rejectInstitutionRequest,
  listInstitutionTypes,
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
};

export default function SolicitudesInstitucionPage() {
  const [filters, setFilters] = React.useState({
    nombre: '',
    tipo: '',
    estado: '',
    email: '',
  });
  const [items, setItems] = React.useState<RequestItem[]>([]);
  const [institutionTypes, setInstitutionTypes] = React.useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  const load = React.useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const data = await listInstitutionRequests(params, token || undefined);
      console.log('Institution requests loaded:', data);
      setItems(Array.isArray(data) ? (data as RequestItem[]) : []);
    } catch (err) {
      console.error('Error loading institution requests:', err);
      setError('No se pudieron cargar las solicitudes de instituciones');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadInstitutionTypes();
    load();
  }, [load, loadInstitutionTypes]);

  const onApprove = async (id: number | string) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await approveInstitutionRequest(id, token || undefined);
      load(); // Recargar la lista
    } catch (err) {
      console.error('Error approving institution request:', err);
      setError('No se pudo aprobar la solicitud');
    }
  };

  const onReject = async (id: number | string) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await rejectInstitutionRequest(id, token || undefined);
      load(); // Recargar la lista
    } catch (err) {
      console.error('Error rejecting institution request:', err);
      setError('No se pudo rechazar la solicitud');
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <header className={styles.header}>
        <h1>Solicitudes de Instituciones</h1>
      </header>

      <div className={styles.filters}>
        <Input
          placeholder='Buscar por nombre'
          value={filters.nombre}
          onChange={e => setFilters({ ...filters, nombre: e.target.value })}
        />
        <Input
          placeholder='Buscar por email'
          value={filters.email}
          onChange={e => setFilters({ ...filters, email: e.target.value })}
        />
        <Button onClick={() => load(filters)}>Buscar</Button>
        <Button
          variant='outline'
          onClick={() => {
            setFilters({ nombre: '', tipo: '', estado: '', email: '' });
            load();
          }}
        >
          Limpiar Filtros
        </Button>
      </div>

      {loading ? (
        <div>Cargando solicitudes...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No hay solicitudes de instituciones Pendientes
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
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
                        it.estado === 'Pendiente' ? '#fff3cd' : '#d4edda',
                      color: it.estado === 'Pendiente' ? '#856404' : '#155724',
                    }}
                  >
                    {it.estado}
                  </span>
                </td>
                <td>{it.email}</td>
                <td>{it.fechaSolicitud}</td>
                <td>
                  <div className={styles.actions}>
                    {it.estado === 'Pendiente' && (
                      <>
                        <Button
                          onClick={() => onApprove(it.id)}
                          style={{ background: '#28a745', color: 'white' }}
                        >
                          Aprobar
                        </Button>
                        <Button
                          onClick={() => onReject(it.id)}
                          style={{ background: '#dc3545', color: 'white' }}
                        >
                          Rechazar
                        </Button>
                      </>
                    )}
                    {it.estado !== 'Pendiente' && (
                      <span style={{ color: '#666', fontSize: '12px' }}>
                        Procesada
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
