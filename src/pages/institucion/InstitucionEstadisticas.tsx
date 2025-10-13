import { useEffect, useState } from 'react';
import styles from './InstitucionEstadisticas.module.css';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/toast/useToast';
import {
  getInstitutionStatsGeneral,
  exportInstitutionStatsGeneral,
  getInstitutionStatsCareers,
  getInstitutionStatsCareer,
  exportInstitutionStatsCareer,
} from '../../services/institutions';
import { listCareerTypes } from '../../services/admin';

type CareerType = { id: string | number; nombre: string };
type Career = {
  id: string | number;
  nombre?: string;
  title?: string;
  titulo?: string;
};
type GeneralStats = {
  cantidadTotal?: number;
  cantidadBaja?: number;
  maximaCompatibilidad?: number;
  // add other fields returned by the API as needed
};
type CareerStats = {
  maxima?: number;
  vecesTop?: number;
  favoritos?: number;
  // add other fields returned by the API as needed
};

export default function InstitucionEstadisticas() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'general' | 'career'>('general');

  // common filters
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [careerTypes, setCareerTypes] = useState<CareerType[]>([]);
  const [selectedCareerType, setSelectedCareerType] = useState<string | 'all'>(
    'all'
  );

  // general stats
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState(false);

  // careers list for "por carrera"
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [careerStats, setCareerStats] = useState<CareerStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const d = await listCareerTypes();
        // normalize result: accept array or object with data/items
        let arr: CareerType[] = [];
        if (Array.isArray(d)) arr = d as CareerType[];
        else if (d && typeof d === 'object') {
          const dd = d as Record<string, unknown>;
          const cand =
            dd['careerTypes'] ?? dd['tipos'] ?? dd['items'] ?? dd['data'];
          if (Array.isArray(cand)) arr = cand as CareerType[];
        }
        setCareerTypes(arr);
      } catch {
        // don't block page, but show a toast
        showToast('No se pudieron cargar tipos de carrera', {
          variant: 'warning',
        });
      }

      try {
        const d = await getInstitutionStatsCareers();
        let list: Career[] = [];
        if (Array.isArray(d)) list = d as Career[];
        else if (d && typeof d === 'object') {
          const dd = d as Record<string, unknown>;
          const cand = dd['carreras'] ?? dd['items'] ?? dd['data'];
          if (Array.isArray(cand)) list = cand as Career[];
        }
        setCareers(list);
      } catch {
        // show toast but allow page to render
        showToast('No se pudieron cargar las carreras', { variant: 'warning' });
      }
    }
    load();
  }, [showToast]);

  const formatError = (err: unknown, fallback = 'Ocurrió un error') => {
    if (!err) return fallback;
    try {
      if (typeof err === 'object' && err !== null) {
        const obj = err as Record<string, unknown>;
        const resp = obj['response'] as Record<string, unknown> | undefined;
        if (resp && resp['data']) {
          const d = resp['data'];
          if (typeof d === 'string') return d;
          if (typeof d === 'object' && d !== null) {
            const dd = d as Record<string, unknown>;
            if (dd['message']) return String(dd['message']);
            if (dd['error']) return String(dd['error']);
          }
        }
        if (obj['message']) return String(obj['message']);
      }
      return typeof err === 'object' ? JSON.stringify(err) : String(err);
    } catch {
      return fallback;
    }
  };

  const onSearchGeneral = async () => {
    // validation: to <= today
    const today = new Date();
    if (to) {
      const td = new Date(to);
      if (td.getTime() > today.getTime()) {
        showToast('Fecha "Hasta" no puede ser mayor a hoy', {
          variant: 'error',
        });
        return;
      }
    }
    setLoading(true);
    try {
      const params: Record<string, unknown> = { from, to };
      if (selectedCareerType && selectedCareerType !== 'all')
        params.tiposCarrera = selectedCareerType;
      const data = await getInstitutionStatsGeneral(params);
      // normalize into GeneralStats
      if (data && typeof data === 'object')
        setGeneralStats(data as GeneralStats);
      else setGeneralStats(null);
    } catch (err) {
      showToast(formatError(err, 'Error al obtener estadísticas generales'), {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const onExportGeneral = async (format: 'pdf' | 'csv') => {
    try {
      const params: Record<string, unknown> = { from, to };
      if (selectedCareerType && selectedCareerType !== 'all')
        params.tiposCarrera = selectedCareerType;
      const blob = await exportInstitutionStatsGeneral(params, format);
      const file = blob instanceof Blob ? blob : new Blob([blob as BlobPart]);
      const url = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `estadisticas_generales.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      showToast(formatError(err, 'Error al exportar'), { variant: 'error' });
    }
  };

  const onSearchCareer = async () => {
    if (!selectedCareer) {
      showToast('Debe seleccionar una carrera', { variant: 'error' });
      return;
    }
    if (to) {
      const td = new Date(to);
      if (td.getTime() > new Date().getTime()) {
        showToast('Fecha "Hasta" no puede ser mayor a hoy', {
          variant: 'error',
        });
        return;
      }
    }
    try {
      const params: Record<string, unknown> = { from, to };
      const id = selectedCareer.id;
      const data = await getInstitutionStatsCareer(id, params);
      setCareerStats(
        data && typeof data === 'object' ? (data as CareerStats) : null
      );
    } catch (err) {
      showToast(
        formatError(err, 'Error al obtener estadísticas de la carrera'),
        { variant: 'error' }
      );
    }
  };

  const onExportCareer = async (format: 'pdf' | 'csv') => {
    if (!selectedCareer) {
      showToast('Debe seleccionar una carrera', { variant: 'error' });
      return;
    }
    try {
      const params = { from, to };
      const blob = await exportInstitutionStatsCareer(
        selectedCareer.id,
        params,
        format
      );
      const file = blob instanceof Blob ? blob : new Blob([blob as BlobPart]);
      const url = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `estadisticas_carrera_${selectedCareer.id}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      showToast(formatError(err, 'Error al exportar'), { variant: 'error' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Estadísticas</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            onClick={() =>
              tab === 'general' ? onExportGeneral('pdf') : onExportCareer('pdf')
            }
          >
            Exportar PDF
          </Button>
          <Button
            onClick={() =>
              tab === 'general' ? onExportGeneral('csv') : onExportCareer('csv')
            }
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className={styles.tabs}>
        <div
          className={`${styles.tab} ${tab === 'general' ? styles.active : ''}`}
          onClick={() => setTab('general')}
        >
          Estadísticas generales
        </div>
        <div
          className={`${styles.tab} ${tab === 'career' ? styles.active : ''}`}
          onClick={() => setTab('career')}
        >
          Estadísticas por carrera
        </div>
      </div>

      <div className={styles.filters}>
        <div>
          <label>Fecha desde</label>
          <Input
            type='date'
            value={from}
            onChange={e => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label>Fecha hasta</label>
          <Input type='date' value={to} onChange={e => setTo(e.target.value)} />
        </div>
        {tab === 'general' && (
          <div>
            <label>Tipo de carrera</label>
            <select
              value={selectedCareerType}
              onChange={e => setSelectedCareerType(e.target.value)}
              style={{ width: '100%', padding: 8 }}
            >
              <option value='all'>Todas</option>
              {careerTypes.map(ct => (
                <option key={String(ct.id)} value={String(ct.id)}>
                  {ct.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <Button
            onClick={() =>
              tab === 'general' ? onSearchGeneral() : onSearchCareer()
            }
          >
            Buscar
          </Button>
        </div>
      </div>

      <div className={styles.board}>
        {tab === 'general' ? (
          <div>
            {loading ? (
              <div>Cargando...</div>
            ) : (
              <>
                <div className={styles.statsRow}>
                  <div className={styles.statsBox}>
                    Carreras cargadas: {generalStats?.cantidadTotal ?? '--'}
                  </div>
                  <div className={styles.statsBox}>
                    Carreras dadas de baja: {generalStats?.cantidadBaja ?? '--'}
                  </div>
                  <div className={styles.statsBox}>
                    Máxima compatibilidad:{' '}
                    {generalStats?.maximaCompatibilidad ?? '--'}
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  {/* Placeholder chart area */}
                  <div
                    style={{ height: 240, background: '#fff', borderRadius: 8 }}
                  >
                    Gráfico de barras (promedio compatibilidades por tipo de
                    carrera)
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 12 }}>
              <label>Seleccionar carrera</label>
              <select
                style={{ width: '100%', padding: 8 }}
                value={selectedCareer?.id ?? ''}
                onChange={e => {
                  const found = careers.find(
                    c => String(c.id) === String(e.target.value)
                  );
                  setSelectedCareer(found || null);
                }}
              >
                <option value=''>-- Seleccionar --</option>
                {careers.map(c => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.nombre ?? c.title ?? c.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className={styles.statsRow}>
                <div className={styles.statsBox}>
                  Máxima calificación: {careerStats?.maxima ?? '--'}
                </div>
                <div className={styles.statsBox}>
                  Veces top: {careerStats?.vecesTop ?? '--'}
                </div>
                <div className={styles.statsBox}>
                  Favoritos totales: {careerStats?.favoritos ?? '--'}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div
                  style={{ height: 220, background: '#fff', borderRadius: 8 }}
                >
                  Evolución de favoritos / historial de compatibilidades
                  (gráfico)
                </div>
              </div>
            </div>

            {/* Export buttons are provided in the header; removed duplicated buttons here */}
          </div>
        )}
      </div>
    </div>
  );
}
