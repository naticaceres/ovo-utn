import { useEffect, useState } from 'react';
import type { CareerDTO } from '../../services/institutions';
import styles from './MisCarrerasPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  getMyCareers,
  createMyCareer,
  updateMyCareer,
  deleteMyCareer,
  getCareerModalities,
  getCareerStates,
} from '../../services/institutions';
import { listCareers } from '../../services/careers';

type MyCareer = CareerDTO;

export default function MisCarrerasPage() {
  const [items, setItems] = useState<CareerDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MyCareer | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [careers, setCareers] = useState<
    Array<{ id: number | string; nombre: string }>
  >([]);
  const [modalities, setModalities] = useState<
    Array<{ id: number | string; nombre: string }>
  >([]);
  const [states, setStates] = useState<
    Array<{ id: number | string; nombre: string }>
  >([]);
  const [idEstado, setIdEstado] = useState<string>('');
  const [cantidadMaterias, setCantidadMaterias] = useState<number | ''>('');
  const [duracionCarrera, setDuracionCarrera] = useState<number | ''>('');
  const [horasCursado, setHorasCursado] = useState<number | ''>('');
  const [montoCuota, setMontoCuota] = useState<number | ''>('');
  // keep selects as strings for consistency with HTML select values
  const [idCarrera, setIdCarrera] = useState<string>('');
  const [idModalidad, setIdModalidad] = useState<string>('');
  const [observaciones, setObservaciones] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [nombreCarreraInput, setNombreCarreraInput] = useState<string>('');
  const [tituloCarreraInput, setTituloCarreraInput] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyCareers();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las carreras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // load selects
    listCareers()
      .then(d => setCareers(Array.isArray(d) ? d : []))
      .catch(err => {
        console.error('Error loading careers:', err);
      });

    // Usar las nuevas funciones de instituciones para modalidades
    getCareerModalities({ includeInactive: 1 })
      .then(d => {
        console.log('Modalities loaded:', d);
        // Mapear a la estructura esperada basado en la respuesta real del endpoint
        let modalitiesData: unknown[] = [];
        if (Array.isArray(d)) {
          modalitiesData = d;
        } else if (d && typeof d === 'object' && 'careerModalities' in d) {
          const response = d as { careerModalities: unknown[] };
          if (Array.isArray(response.careerModalities)) {
            modalitiesData = response.careerModalities;
          }
        }

        const mappedModalities = modalitiesData.map((item: unknown) => {
          const modality = item as Record<string, unknown>;
          return {
            id: String(
              modality.idModalidadCarreraInstitucion ||
                modality.id ||
                modality.idModalidad ||
                ''
            ),
            nombre: String(
              modality.nombreModalidad || modality.nombre || 'Sin nombre'
            ),
          };
        });
        setModalities(mappedModalities);
      })
      .catch(err => {
        console.error('Error loading modalities:', err);
      });

    // Usar las nuevas funciones de instituciones para estados
    getCareerStates({ includeInactive: 1 })
      .then(d => {
        console.log('Career states loaded:', d);
        // Mapear a la estructura esperada basado en la respuesta real del endpoint
        let statesData: unknown[] = [];
        if (Array.isArray(d)) {
          statesData = d;
        } else if (d && typeof d === 'object' && 'careerStates' in d) {
          const response = d as { careerStates: unknown[] };
          if (Array.isArray(response.careerStates)) {
            statesData = response.careerStates;
          }
        }

        const mappedStates = statesData.map((item: unknown) => {
          const state = item as Record<string, unknown>;
          return {
            id: String(
              state.idEstadoCarreraInstitucion ||
                state.id ||
                state.idEstado ||
                ''
            ),
            nombre: String(state.nombreEstado || state.nombre || 'Sin nombre'),
          };
        });
        setStates(mappedStates);
      })
      .catch(err => {
        console.error('Error loading career states:', err);
      });
  }, []);

  const openCreate = () => {
    setEditing(null);
    setIdCarrera('');
    setIdModalidad('');
    setObservaciones('');
    setFechaInicio('');
    setFechaFin('');
    setNombreCarreraInput('');
    setTituloCarreraInput('');
    setShowModal(true);
  };

  const openEdit = (it: MyCareer) => {
    setEditing(it);
    // ensure we set string values for selects
    setIdCarrera(String(it.idCarrera ?? it.id ?? it.careerId ?? ''));
    setIdModalidad(String(it.idModalidad ?? it.idModalidadCarrera ?? ''));
    setObservaciones(String(it.observaciones ?? ''));
    setFechaInicio(String(it.fechaInicio ?? ''));
    setFechaFin(String(it.fechaFin ?? ''));
    setIdEstado(String(it.idEstado ?? ''));
    setCantidadMaterias((it.cantidadMaterias ?? '') as number | '');
    setDuracionCarrera((it.duracionCarrera ?? '') as number | '');
    setHorasCursado((it.horasCursado ?? '') as number | '');
    setMontoCuota((it.montoCuota ?? '') as number | '');
    setNombreCarreraInput(
      String(it.nombreCarrera ?? it.nombre ?? it.tituloCarrera ?? '')
    );
    setTituloCarreraInput(
      String(it.tituloCarrera ?? it.titulo ?? it.nombre ?? '')
    );
    setShowModal(true);
  };

  const save = async () => {
    setModalError(null);
    setError(null);

    // basic validation
    if (!idCarrera) {
      setModalError('Debe seleccionar una carrera');
      return;
    }
    if (!idModalidad) {
      setModalError('Debe seleccionar una modalidad');
      return;
    }
    // backend requires estado and numeric fields
    if (!idEstado) {
      setModalError('Debe seleccionar un estado');
      return;
    }
    if (cantidadMaterias === '') {
      setModalError('Debe completar la cantidad de materias');
      return;
    }
    if (duracionCarrera === '') {
      setModalError('Debe completar la duración de la carrera');
      return;
    }
    if (horasCursado === '') {
      setModalError('Debe completar las horas de cursado');
      return;
    }
    if (montoCuota === '') {
      setModalError('Debe completar el monto de la cuota');
      return;
    }

    // derive nombre/título from selected career
    const selectedCareer = careers.find(
      c => String(c.id) === String(idCarrera)
    );

    // if id values are numeric strings, send numbers; otherwise send strings
    const parseMaybeNumber = (v: string) => {
      if (v == null || v === '') return null;
      const n = Number(v);
      return Number.isNaN(n) ? v : n;
    };

    // helper to produce YYYY-MM-DD for payload
    const formatDateForPayload = (d: string) => {
      if (!d) return null;
      // if already ISO-like
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      // common browser localized format dd/mm/yyyy -> convert
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d)) {
        const [dd, mm, yyyy] = d.split('/');
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      }
      // try Date parse fallback
      const dt = new Date(d);
      if (!isNaN(dt.getTime())) {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
      return null;
    };

    const payload: Record<string, unknown> = {
      idCarrera: parseMaybeNumber(idCarrera),
      idModalidad: parseMaybeNumber(idModalidad),
      idEstado: parseMaybeNumber(idEstado),
      // prefer explicitly entered inputs, fallback to career data
      tituloCarrera: tituloCarreraInput
        ? tituloCarreraInput
        : (((selectedCareer as unknown as { titulo?: string })?.titulo as
            | string
            | undefined) ??
          selectedCareer?.nombre ??
          null),
      nombreCarrera: nombreCarreraInput
        ? nombreCarreraInput
        : (selectedCareer?.nombre ??
          ((selectedCareer as unknown as { titulo?: string })?.titulo as
            | string
            | undefined) ??
          null),
      cantidadMaterias: Number(cantidadMaterias),
      duracionCarrera: Number(duracionCarrera),
      horasCursado: Number(horasCursado),
      montoCuota: Number(montoCuota),
      observaciones: observaciones || null,
      fechaInicio: formatDateForPayload(fechaInicio),
      fechaFin: formatDateForPayload(fechaFin) || '',
    };

    try {
      if (editing && (editing.id || editing.idCarrera)) {
        const id = editing.id ?? editing.idCarrera;
        await updateMyCareer(id as string | number, payload);
      } else {
        await createMyCareer(payload);
      }
      await load();
      setShowModal(false);
    } catch (e) {
      console.error(e);
      setModalError('Error al guardar la carrera');
      setError('Error al guardar la carrera');
    }
  };

  const remove = async (id: number | string) => {
    setError(null);
    try {
      await deleteMyCareer(id);
      await load();
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar la carrera');
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1 className={styles.title}>Mis carreras</h1>
        <Button onClick={openCreate}>+ Agregar</Button>
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
              <th>Título</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id ?? it.idCarrera ?? JSON.stringify(it)}>
                <td>{it.nombreCarrera ?? it.nombre ?? it.tituloCarrera}</td>
                <td>{it.tituloCarrera ?? it.titulo}</td>
                <td>
                  {(() => {
                    const f = it.fechaFin ?? null;
                    if (f && String(f).trim() !== '') return 'Baja';
                    return it.activo ? 'Activo' : 'Inactivo';
                  })()}
                </td>
                <td>
                  <div className={styles.actions}>
                    <Button variant='outline' onClick={() => openEdit(it)}>
                      ✏️
                    </Button>
                    <Button
                      onClick={() => {
                        const idToRemove = (it.id ?? it.idCarrera) as
                          | string
                          | number
                          | undefined;
                        if (!idToRemove) {
                          setError('Id de carrera inválido');
                          return;
                        }
                        remove(idToRemove);
                      }}
                    >
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
            <h3>{editing ? 'Editar carrera' : 'Agregar carrera'}</h3>

            <div className={styles.twoColRow}>
              <div>
                <label>Elegir carrera (Carrera base)</label>
                <select
                  value={idCarrera ?? ''}
                  onChange={e => setIdCarrera(e.target.value)}
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                >
                  <option value=''>-- Seleccionar --</option>
                  {careers.map(c => (
                    <option key={String(c.id)} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Modalidad</label>
                <select
                  value={idModalidad ?? ''}
                  onChange={e => setIdModalidad(e.target.value)}
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                >
                  <option value=''>-- Seleccionar --</option>
                  {modalities.map(m => (
                    <option key={String(m.id)} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label>Estado</label>
            <select
              value={idEstado ?? ''}
              onChange={e => setIdEstado(e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
            >
              <option value=''>-- Seleccionar --</option>
              {states.map(s => (
                <option key={String(s.id)} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>

            <div className={styles.twoColRow}>
              <Input
                label='Nombre de carrera'
                value={nombreCarreraInput}
                onChange={e => setNombreCarreraInput(e.target.value)}
                fullWidth
              />
              <Input
                label='Título de carrera'
                value={tituloCarreraInput}
                onChange={e => setTituloCarreraInput(e.target.value)}
                fullWidth
              />
            </div>

            <div className={styles.twoColRow}>
              <Input
                label='Cantidad de materias'
                type='number'
                value={cantidadMaterias === '' ? '' : String(cantidadMaterias)}
                onChange={e =>
                  setCantidadMaterias(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                fullWidth
              />
              <Input
                label='Duración (años)'
                type='number'
                step='0.1'
                value={duracionCarrera === '' ? '' : String(duracionCarrera)}
                onChange={e =>
                  setDuracionCarrera(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                fullWidth
              />
            </div>
            <div className={styles.twoColRow}>
              <Input
                label='Horas cursado'
                type='number'
                value={horasCursado === '' ? '' : String(horasCursado)}
                onChange={e =>
                  setHorasCursado(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                fullWidth
              />
              <Input
                label='Monto cuota'
                type='number'
                step='0.01'
                value={montoCuota === '' ? '' : String(montoCuota)}
                onChange={e =>
                  setMontoCuota(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                fullWidth
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label>Fecha Inicio</label>
                <Input
                  type='date'
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  fullWidth
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Fecha Fin</label>
                <Input
                  type='date'
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  fullWidth
                />
              </div>
            </div>

            <label style={{ marginTop: 8 }}>Notas Adicionales</label>
            <Input
              label='Observaciones'
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              fullWidth
            />
            {modalError && (
              <div
                style={{ color: 'var(--error-color, #d9534f)', marginTop: 8 }}
              >
                {modalError}
              </div>
            )}

            <div className={styles.modalActions}>
              <Button variant='outline' onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={save}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
