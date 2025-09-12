import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './SolicitudesInstitucionPage.module.css';
import {
  listInstitutionRequests,
  approveInstitutionRequest,
  rejectInstitutionRequest,
} from '../../services/admin';

type RequestItem = {
  id: number | string;
  nombre?: string;
  tipo?: string;
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
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await listInstitutionRequests(params);
      setItems(Array.isArray(data) ? (data as RequestItem[]) : []);
    } catch {
      setError('No se pudieron cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onApprove = async (id: number | string) => {
    try {
      await approveInstitutionRequest(id);
      load();
    } catch {
      setError('No se pudo aprobar');
    }
  };

  const onReject = async (id: number | string) => {
    try {
      await rejectInstitutionRequest(id);
      load();
    } catch {
      setError('No se pudo rechazar');
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
        <div>Cargando...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
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
                <td>{it.tipo}</td>
                <td>{it.localizacion}</td>
                <td>{it.estado}</td>
                <td>{it.email}</td>
                <td>{it.fechaSolicitud}</td>
                <td>
                  <div className={styles.actions}>
                    <Button
                      onClick={() => onApprove(it.id)}
                      style={{ background: '#28a745' }}
                    >
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => onReject(it.id)}
                      style={{ background: '#dc3545' }}
                    >
                      Rechazar
                    </Button>
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
