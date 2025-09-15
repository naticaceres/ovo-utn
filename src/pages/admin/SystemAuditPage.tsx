import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './SystemAuditPage.module.css';
import { audit, exportAudit } from '../../services/admin';

type AuditEntry = {
  fechaHora?: string;
  usuario?: string | Record<string, unknown>;
  accion?: string;
  clase?: string;
  modulo?: string;
};

export default function SystemAuditPage() {
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [modulo, setModulo] = React.useState('');
  const [tipoAccion, setTipoAccion] = React.useState('');

  const [rows, setRows] = React.useState<AuditEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      if (from) params.from = from;
      if (to) params.to = to;
      if (modulo) params.modulo = modulo;
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
  }, [from, to, userId, modulo, tipoAccion]);

  const onExport = async (format: 'pdf' | 'csv') => {
    try {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      if (from) params.from = from;
      if (to) params.to = to;
      if (modulo) params.modulo = modulo;
      if (tipoAccion) params.tipoAccion = tipoAccion;
      const blob = await exportAudit(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo exportar');
    }
  };

  const renderCell = (v: unknown) => {
    if (v === null || typeof v === 'undefined') return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    if (typeof v === 'object') {
      const o = v as Record<string, unknown>;
      const nombre = (o['nombre'] as string) || (o['name'] as string) || '';
      const apellido =
        (o['apellido'] as string) || (o['lastName'] as string) || '';
      if (nombre || apellido) return `${nombre} ${apellido}`.trim();
      if (o['id']) return String(o['id']);
      return JSON.stringify(o);
    }
    return String(v);
  };

  const pick = (obj: Record<string, unknown> | undefined, keys: string[]) => {
    if (!obj) return undefined;
    for (const k of keys) {
      if (typeof obj[k] !== 'undefined' && obj[k] !== null) return obj[k];
    }
    return undefined;
  };

  const renderDate = (r: AuditEntry) => {
    const v = pick(r as unknown as Record<string, unknown>, [
      'fechaHora',
      'fecha',
      'date',
      'timestamp',
    ]);
    return v ? String(v) : '';
  };

  const renderAction = (r: AuditEntry) => {
    const v = pick(r as unknown as Record<string, unknown>, [
      'accion',
      'action',
      'tipo',
      'tipoAccion',
    ]);
    return v ? String(v) : '';
  };

  // renderClase removed per UI request

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
        <Input
          label='Módulo'
          placeholder='Buscar módulo'
          value={modulo}
          onChange={e => setModulo(e.target.value)}
        />
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>
            Tipo de acción
          </label>
          <select
            value={tipoAccion}
            onChange={e => setTipoAccion(e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 6,
              border: '1px solid #e6e6e6',
            }}
          >
            <option value=''>Todos</option>
            <option value='CREACION'>CREACION</option>
            <option value='UPDATE'>UPDATE</option>
            <option value='DELETE'>DELETE</option>
          </select>
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
              <th>Acción</th>
              <th>Módulo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{renderDate(r)}</td>
                <td>{renderCell(r.usuario)}</td>
                <td>{renderAction(r)}</td>
                <td>{renderCell(r.modulo)}</td>
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
