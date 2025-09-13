import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './AccessHistoryPage.module.css';
import { accessHistory, exportAccessHistory } from '../../services/admin';

type Entry = {
  fechaHora?: string;
  usuario?: string;
  ip?: string;
  dispositivo?: string;
  estado?: string;
};

export default function AccessHistoryPage() {
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [ip, setIp] = React.useState('');
  const [estado, setEstado] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<Entry[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      if (from) params.from = from;
      if (to) params.to = to;
      if (ip) params.ip = ip;
      if (estado) params.estado = estado;
      const data = await accessHistory(params);
      const raw = ((): Entry[] => {
        if (Array.isArray(data)) return data as Entry[];
        const o = data as unknown as Record<string, unknown>;
        if (Array.isArray(o['data'])) return o['data'] as Entry[];
        if (Array.isArray(o['history'])) return o['history'] as Entry[];
        return [];
      })();
      setRows(raw);
    } catch {
      setError('No se pudo obtener el historial');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [from, to, userId, ip, estado]);

  React.useEffect(() => {
    // optionally load a default range on mount
  }, []);

  const onExport = async (format: 'pdf' | 'csv') => {
    try {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      if (from) params.from = from;
      if (to) params.to = to;
      if (ip) params.ip = ip;
      if (estado) params.estado = estado;
      const blob = await exportAccessHistory(params);
      // exportAccessHistory returns a blob (responseType 'blob') according to service
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `access-history.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo exportar');
    }
  };

  const renderCell = (value: unknown) => {
    if (value === null || typeof value === 'undefined') return '';
    if (typeof value === 'string' || typeof value === 'number')
      return String(value);
    // If it's an object, try to render friendly fields
    if (typeof value === 'object') {
      const o = value as Record<string, unknown>;
      // common name fields
      const nombre =
        (o['nombre'] as string) ||
        (o['firstName'] as string) ||
        (o['name'] as string) ||
        '';
      const apellido =
        (o['apellido'] as string) || (o['lastName'] as string) || '';
      const id = o['id'] ?? o['_id'] ?? '';
      const full =
        `${nombre || ''}${nombre && apellido ? ' ' : ''}${apellido || ''}`.trim();
      if (full) return full;
      if (id) return String(id);
      try {
        return JSON.stringify(o);
      } catch {
        return '';
      }
    }
    return String(value);
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Historial de Accesos</h1>
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
          label='Usuario (id)'
          placeholder='Buscar usuario'
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <Input
          label='IP'
          placeholder='Buscar IP'
          value={ip}
          onChange={e => setIp(e.target.value)}
        />
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Estado</label>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 6,
              border: '1px solid #e6e6e6',
            }}
          >
            <option value=''>Todos</option>
            <option value='Exitoso'>Exitoso</option>
            <option value='Fallido'>Fallido</option>
            <option value='Error'>Error</option>
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
              <th>IP</th>
              <th>Dispositivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{renderCell(r.fechaHora)}</td>
                <td>{renderCell(r.usuario)}</td>
                <td>{renderCell(r.ip)}</td>
                <td>{renderCell(r.dispositivo)}</td>
                <td>{renderCell(r.estado)}</td>
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
