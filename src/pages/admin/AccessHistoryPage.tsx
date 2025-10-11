import React from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './AccessHistoryPage.module.css';
import {
  accessHistory,
  exportAccessHistoryFile,
  listUsers,
} from '../../services/admin';
import { getApiErrorMessage } from '../../context/api';
import { useToast } from '../../components/ui/toast/useToast';
import type { BasicUserDTO } from '../../services/admin';

type Entry = {
  fechaHora?: string;
  usuario?: string;
  ip?: string;
  dispositivo?: string;
  estado?: string;
};

type SimpleUser = {
  id: number | string;
  nombre?: string;
  apellido?: string;
  mail?: string;
  email?: string;
  nombreCompleto?: string;
};

export default function AccessHistoryPage() {
  const { showToast } = useToast();
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [ip, setIp] = React.useState('');
  const [estado, setEstado] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<Entry[]>([]);

  const [error, setError] = React.useState<string | null>(null);

  // listado de usuarios para el select
  const [users, setUsers] = React.useState<SimpleUser[]>([]);
  const [usersLoading, setUsersLoading] = React.useState(false);
  const [usersError, setUsersError] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await listUsers();
      const raw: BasicUserDTO[] = Array.isArray(data) ? data : [];
      const mapped: SimpleUser[] = raw.map(u => ({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        mail: u.mail || u.email,
        nombreCompleto: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
      }));
      setUsers(mapped);
    } catch (err) {
      const msg = getApiErrorMessage(err) || 'No se pudieron cargar usuarios';
      setUsersError(msg);
      showToast(msg, { variant: 'error' });
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [showToast]);

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
    } catch (err) {
      const msg = getApiErrorMessage(err) || 'No se pudo obtener el historial';
      setError(msg);
      showToast(msg, { variant: 'error' });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [from, to, userId, ip, estado, showToast]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const onExport = async (format: 'pdf' | 'csv') => {
    try {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      if (from) params.from = from;
      if (to) params.to = to;
      if (ip) params.ip = ip;
      if (estado) params.estado = estado;
      await exportAccessHistoryFile(params, 'access-history', format);
      showToast('Exportación iniciada', { variant: 'success' });
    } catch (err) {
      const msg = getApiErrorMessage(err) || 'No se pudo exportar';
      setError(msg);
      showToast(msg, { variant: 'error' });
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

  // helper to pull a field by multiple possible names
  const pick = (obj: Record<string, unknown> | undefined, keys: string[]) => {
    if (!obj) return undefined;
    for (const k of keys) {
      if (typeof obj[k] !== 'undefined' && obj[k] !== null) return obj[k];
    }
    return undefined;
  };

  const renderDate = (r: Entry) => {
    // try common names: fechaHora, fecha, date, timestamp
    const val = pick(r as unknown as Record<string, unknown>, [
      'fechaHora',
      'fecha',
      'date',
      'timestamp',
    ]);
    if (!val) return '';
    // if object with fecha inside
    if (typeof val === 'object') {
      const inner = pick(val as Record<string, unknown>, ['fecha', 'date']);
      return inner ? String(inner) : JSON.stringify(val);
    }
    return String(val);
  };

  const renderDevice = (r: Entry) => {
    const val = pick(r as unknown as Record<string, unknown>, [
      'dispositivo',
      'device',
      'navegador',
      'userAgent',
      'ua',
    ]);
    if (!val) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Historial de Accesos</h1>
        <div className={styles.toolbar}>
          <Button onClick={() => fetch()} disabled={loading}>
            Buscar
          </Button>
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
        <div className={styles.fieldGroup}>
          <label>Usuario</label>
          <select
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className={styles.select}
            disabled={usersLoading}
          >
            <option value=''>Seleccione</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.nombreCompleto ||
                  `${u.nombre || ''} ${u.apellido || ''}`.trim() ||
                  u.mail ||
                  u.email ||
                  u.id}
              </option>
            ))}
          </select>
          {usersLoading && (
            <div style={{ fontSize: 12 }}>Cargando usuarios...</div>
          )}
          {usersError && <div className={styles.error}>{usersError}</div>}
        </div>
        <Input
          label='IP'
          placeholder='Buscar IP'
          value={ip}
          onChange={e => setIp(e.target.value)}
        />
        <div className={styles.fieldGroup}>
          <label>Estado</label>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className={styles.select}
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
                <td>{renderDate(r)}</td>
                <td>{renderCell(r.usuario)}</td>
                <td>{renderCell(r.ip)}</td>
                <td>{renderDevice(r)}</td>
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
