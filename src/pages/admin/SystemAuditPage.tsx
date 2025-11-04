import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './SystemAuditPage.module.css';
import { audit, exportAuditFile, listActionTypes } from '../../services/admin';
import { getApiErrorMessage } from '../../context/api';
import { useToast } from '../../components/ui/toast/useToast';

type AuditEntry = {
  detalle?: string;
  fecha?: string;
  idTipoAccion?: number;
  idUsuario?: number;
  nombreTipoAccion?: string;
  nombreUsuario?: string;
};

type ActionType = {
  id: number | string;
  nombre: string;
};

export default function SystemAuditPage() {
  const { showToast } = useToast();
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [tipoAccion, setTipoAccion] = React.useState('');

  const [rows, setRows] = React.useState<AuditEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Estado para los tipos de acción desde el catálogo
  const [actionTypes, setActionTypes] = React.useState<ActionType[]>([]);
  const [actionTypesLoading, setActionTypesLoading] = React.useState(false);
  const [actionTypesError, setActionTypesError] = React.useState<string | null>(
    null
  );

  // Cargar los tipos de acción desde el catálogo
  const loadActionTypes = React.useCallback(async () => {
    setActionTypesLoading(true);
    setActionTypesError(null);
    try {
      const data = await listActionTypes();
      const raw: ActionType[] = Array.isArray(data) ? data : [];
      setActionTypes(raw);
    } catch (err) {
      const msg =
        getApiErrorMessage(err) || 'No se pudieron cargar los tipos de acción';
      setActionTypesError(msg);
      showToast(msg, { variant: 'error' });
      setActionTypes([]);
    } finally {
      setActionTypesLoading(false);
    }
  }, [showToast]);

  // Cargar tipos de acción al montar el componente
  React.useEffect(() => {
    loadActionTypes();
  }, [loadActionTypes]);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      if (from) params.from = from;
      if (to) params.to = to;
      if (tipoAccion) params.tipoAccion = tipoAccion;
      const data = await audit(params);
      const raw = ((): AuditEntry[] => {
        if (Array.isArray(data)) return data as AuditEntry[];
        const o = data as unknown as Record<string, unknown>;
        if (Array.isArray(o['data'])) return o['data'] as AuditEntry[];
        if (Array.isArray(o['audit'])) return o['audit'] as AuditEntry[];
        return [];
      })();
      setRows(raw);
    } catch {
      setError('No se pudo obtener el historial de auditoría');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [from, to, userId, tipoAccion]);

  const onExport = async (format: 'pdf' | 'csv') => {
    try {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      if (from) params.from = from;
      if (to) params.to = to;
      if (tipoAccion) params.tipoAccion = tipoAccion;
      await exportAuditFile(params, 'audit', format);
    } catch {
      setError('No se pudo exportar');
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Historial de acciones del sistema</h1>
        <div className={styles.toolbar}>
          <Button onClick={() => fetch()}>Buscar</Button>
        </div>
      </div>

      <div className={styles.filters}>
        <Input
          label='Fecha desde'
          type='date'
          value={from}
          onChange={e => setFrom(e.target.value)}
        />
        <Input
          label='Fecha hasta'
          type='date'
          value={to}
          onChange={e => setTo(e.target.value)}
        />
        <Input
          label='Usuario'
          placeholder='Buscar usuario'
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <div className={styles.fieldGroup}>
          <label>Tipo de acción</label>
          <select
            value={tipoAccion}
            onChange={e => setTipoAccion(e.target.value)}
            className={styles.select}
            disabled={actionTypesLoading}
          >
            <option value=''>Todos</option>
            {actionTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.nombre}
              </option>
            ))}
          </select>
          {actionTypesLoading && (
            <div style={{ fontSize: 12 }}>Cargando tipos de acción...</div>
          )}
          {actionTypesError && (
            <div className={styles.error}>{actionTypesError}</div>
          )}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Usuario</th>
              <th>Tipo de Acción</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.fecha || ''}</td>
                <td>{r.nombreUsuario || ''}</td>
                <td>{r.nombreTipoAccion || ''}</td>
                <td>{r.detalle || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          marginTop: 12,
        }}
      >
        <Button variant='outline' onClick={() => onExport('pdf')}>
          Exportar PDF
        </Button>
        <Button onClick={() => onExport('csv')}>Exportar CSV</Button>
      </div>
    </div>
  );
}
