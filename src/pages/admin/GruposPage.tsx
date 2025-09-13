import React from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import styles from './GruposPage.module.css';
import { Input } from '../../components/ui/Input';
import {
  listGroupsCatalog,
  createGroupCatalog,
  updateGroupCatalog,
  deactivateGroupCatalog,
  listPermissions,
} from '../../services/admin';

type Group = {
  id: number | string;
  nombreGrupo: string;
  descripcion?: string;
  permisos?: Array<
    number | string | { nombrePermiso?: string; nombre?: string }
  >;
  activo?: boolean;
};

export default function GruposPage() {
  const [items, setItems] = React.useState<Group[]>([]);
  const [perms, setPerms] = React.useState<
    Array<{ id: number | string; nombre: string }>
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Group | null>(null);

  const [nombre, setNombre] = React.useState('');
  const [descripcion, setDescripcion] = React.useState('');
  const [selectedPerms, setSelectedPerms] = React.useState<
    Array<number | string>
  >([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listGroupsCatalog({ includeInactive: 1 });
      const raw = data as unknown as Record<string, unknown>;
      const arr = Array.isArray(data)
        ? (data as unknown[])
        : Array.isArray(raw['groups'])
          ? (raw['groups'] as unknown[])
          : Array.isArray(raw['data'])
            ? (raw['data'] as unknown[])
            : [];
      setItems(
        arr.map(g => {
          const obj = g as Record<string, unknown>;
          // detect possible "fecha fin" fields coming from different backends
          const fechaFin = (obj['fechaFin'] ??
            obj['fecha_fin'] ??
            obj['fechaBaja'] ??
            obj['fecha_baja'] ??
            obj['fechaHasta'] ??
            obj['fecha_hasta'] ??
            obj['endDate'] ??
            obj['end_date'] ??
            '') as string;
          const activo =
            // if fechaFin is present and non-empty, consider it deactivated (Baja)
            fechaFin && String(fechaFin).trim() !== ''
              ? false
              : typeof obj['activo'] !== 'undefined'
                ? Boolean(obj['activo'])
                : true;

          return {
            id: (obj['id'] ?? '') as number | string,
            nombreGrupo: (obj['nombreGrupo'] ??
              obj['nombre'] ??
              obj['label'] ??
              '') as string,
            descripcion: (obj['descripcion'] ??
              obj['description'] ??
              '') as string,
            permisos: (obj['permisos'] ?? obj['permissions'] ?? []) as Array<
              number | string | Record<string, unknown>
            >,
            activo: activo,
            // keep fechaFin for possible future use
            fechaFin: fechaFin,
          } as Group & { fechaFin?: string };
        })
      );

      // load permissions list for modal
      const pData = await listPermissions();
      const rawP = pData as unknown as Record<string, unknown>;
      const parr = Array.isArray(pData)
        ? pData
        : Array.isArray(rawP['permissions'])
          ? (rawP['permissions'] as unknown[])
          : Array.isArray(rawP['data'])
            ? (rawP['data'] as unknown[])
            : [];
      setPerms(
        (Array.isArray(parr) ? parr : []).map((p: unknown) => {
          const obj = p as Record<string, unknown>;
          return {
            id: (obj['id'] ?? obj['idPermiso'] ?? '') as number | string,
            nombre: (obj['nombrePermiso'] ?? obj['nombre'] ?? '') as string,
          };
        })
      );
    } catch {
      setError('No se pudieron cargar los grupos');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setNombre('');
    setDescripcion('');
    setSelectedPerms([]);
    setShowModal(true);
  };

  const openEdit = (it: Group) => {
    setEditing(it);
    setNombre(it.nombreGrupo || '');
    setDescripcion(it.descripcion || '');
    // normalize permisos to array of ids
    const ids = Array.isArray(it.permisos)
      ? it.permisos.map(p => {
          if (typeof p === 'object') {
            const obj = p as Record<string, unknown>;
            return (obj['id'] ??
              obj['idPermiso'] ??
              obj['nombrePermiso'] ??
              obj['nombre'] ??
              '') as number | string;
          }
          return p as number | string;
        })
      : [];
    setSelectedPerms(ids as Array<number | string>);
    setShowModal(true);
  };

  const togglePerm = (id: number | string) => {
    setSelectedPerms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const save = async () => {
    setError(null);
    try {
      // ensure permisos are numbers when possible (backend expects ids)
      const permisosPayload = selectedPerms.map(p => {
        if (typeof p === 'string' && /^\d+$/.test(p)) return parseInt(p, 10);
        return p;
      });

      const body = {
        nombreGrupo: nombre,
        descripcion,
        permisos: permisosPayload,
      };
      console.log('[GruposPage] saving group payload:', {
        id: editing?.id,
        body,
      });
      let resp;
      if (editing) {
        resp = await updateGroupCatalog(editing.id, body);
      } else {
        resp = await createGroupCatalog(body);
      }
      console.log('[GruposPage] save response:', resp);
      setShowModal(false);
      await load();
    } catch (err) {
      // try to extract server error message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e: any = err;
      console.error('[GruposPage] save error:', e);
      const serverMessage =
        e?.response?.data?.message ?? e?.response?.data ?? e?.message ?? null;
      setError(serverMessage ? String(serverMessage) : 'Error al guardar');
    }
  };

  const remove = async (id: number | string, nombreGrupo?: string) => {
    setError(null);
    try {
      await deactivateGroupCatalog(id, nombreGrupo);
      load();
    } catch {
      setError('No se pudo eliminar');
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1>Grupos de Usuarios</h1>
        <Button onClick={openCreate}>+ Agregar grupo</Button>
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
              <th>Descripción</th>
              <th>Permisos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id}>
                <td>{it.nombreGrupo}</td>
                <td>{it.descripcion}</td>
                <td>
                  {(it.permisos || [])
                    .map(p =>
                      typeof p === 'object' ? (p.nombrePermiso ?? p.nombre) : p
                    )
                    .join(', ')}
                </td>
                <td>
                  {(() => {
                    const rec = it as unknown as Record<string, unknown>;
                    const f =
                      rec['fechaFin'] ??
                      rec['fecha_fin'] ??
                      rec['fechaBaja'] ??
                      rec['fecha_baja'] ??
                      rec['fechaHasta'] ??
                      rec['fecha_hasta'] ??
                      rec['endDate'] ??
                      rec['end_date'] ??
                      '';
                    if (f && String(f).trim() !== '') return 'Baja';
                    return it.activo ? 'Activo' : 'Inactivo';
                  })()}
                </td>
                <td>
                  <div className={styles.actions}>
                    <Button variant='outline' onClick={() => openEdit(it)}>
                      ✏️
                    </Button>
                    <Button onClick={() => remove(it.id, it.nombreGrupo)}>
                      🗑️
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>{editing ? `Editar grupo` : `Nuevo Grupo`}</h3>
            <Input
              label='Nombre'
              fullWidth
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
            <Input
              label='Descripción'
              fullWidth
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />

            <div className={styles.permList}>
              <strong>Permisos</strong>
              <div className={styles.permGrid}>
                {perms.map(p => (
                  <label key={p.id} className={styles.permItem}>
                    <input
                      type='checkbox'
                      checked={selectedPerms.includes(p.id)}
                      onChange={() => togglePerm(p.id)}
                    />
                    {p.nombre}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button variant='outline' onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={save} disabled={!nombre.trim()}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
