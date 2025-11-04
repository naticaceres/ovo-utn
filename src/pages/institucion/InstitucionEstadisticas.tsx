import { useEffect, useState } from 'react';
import styles from './InstitucionEstadisticas.module.css';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/toast/useToast';
import {
  getInstitutionStatsGeneral,
  exportInstitutionStatsGeneral,
} from '../../services/institutions';
import { listCareerTypes } from '../../services/admin';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type CareerType = { id: string | number; nombre: string };

type PromedioCompatibilidadPorTipo = {
  idTipoCarrera: number;
  tipoCarrera: string;
  promedioCompatibilidad: number;
  maxCompatibilidad: number;
  minCompatibilidad: number;
  cantidadTests: number;
  cantidadCarreras: number;
};

type RankingFavorita = {
  idCarreraInstitucion: number;
  nombreCarrera: string;
  totalFavoritos: number;
  porcentajeDelTotal: string;
};

type RankingMaxCompatibilidad = {
  idCarreraInstitucion: number;
  nombreCarrera: string;
  maxCompatibilidad: number;
  promedioCompatibilidad: number;
  cantidadTests: number;
  testsAltaCompatibilidad: number;
};

type GeneralStatsResponse = {
  filters: {
    from: string;
    to: string;
    tiposCarrera: number[] | null;
  };
  totalCarreras: number;
  totalBajas: number;
  promedioCompatibilidadPorTipo: PromedioCompatibilidadPorTipo[];
  rankingFavoritas: RankingFavorita[];
  rankingMaxCompatibilidad: RankingMaxCompatibilidad[];
};

// Colores para los gráficos
const COLORS = [
  '#6a4bd8',
  '#8b5cf6',
  '#a78bfa',
  '#c4b5fd',
  '#ddd6fe',
  '#ede9fe',
];

export default function InstitucionEstadisticas() {
  const { showToast } = useToast();

  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Filtros
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [careerTypes, setCareerTypes] = useState<CareerType[]>([]);
  const [selectedCareerTypes, setSelectedCareerTypes] = useState<string[]>([]);

  // Estadísticas generales
  const [generalStats, setGeneralStats] = useState<GeneralStatsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const d = await listCareerTypes();
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
        showToast('No se pudieron cargar tipos de carrera', {
          variant: 'warning',
        });
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
    // Validación: to <= hoy
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
      if (selectedCareerTypes.length > 0) {
        params.tiposCarrera = selectedCareerTypes.join(',');
      }
      const data = await getInstitutionStatsGeneral(params);
      if (data && typeof data === 'object')
        setGeneralStats(data as GeneralStatsResponse);
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
      if (selectedCareerTypes.length > 0) {
        params.tiposCarrera = selectedCareerTypes.join(',');
      }
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

  const handleCareerTypeChange = (typeId: string) => {
    setSelectedCareerTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Estadísticas de la Institución</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => onExportGeneral('pdf')}>Exportar PDF</Button>
          <Button onClick={() => onExportGeneral('csv')}>Exportar CSV</Button>
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
          <Input
            type='date'
            value={to}
            max={today}
            onChange={e => setTo(e.target.value)}
          />
        </div>
        <div>
          <label>Tipos de carrera</label>
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}
          >
            {careerTypes.map(ct => (
              <label
                key={String(ct.id)}
                style={{ display: 'flex', gap: 4, alignItems: 'center' }}
              >
                <input
                  type='checkbox'
                  checked={selectedCareerTypes.includes(String(ct.id))}
                  onChange={() => handleCareerTypeChange(String(ct.id))}
                />
                {ct.nombre}
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <Button onClick={onSearchGeneral}>Buscar</Button>
        </div>
      </div>

      <div className={styles.board}>
        {loading ? (
          <div className={styles.loading}>Cargando...</div>
        ) : generalStats ? (
          <>
            <div className={styles.statsRow}>
              <div className={styles.statsBox}>
                <h3>Total de Carreras</h3>
                <p className={styles.bigNumber}>{generalStats.totalCarreras}</p>
              </div>
              <div className={styles.statsBox}>
                <h3>Carreras de Baja</h3>
                <p className={styles.bigNumber}>{generalStats.totalBajas}</p>
              </div>
            </div>

            {/* Promedio de Compatibilidad por Tipo */}
            {generalStats.promedioCompatibilidadPorTipo.length > 0 && (
              <div className={styles.section}>
                <h3>Promedio de Compatibilidad por Tipo de Carrera</h3>

                {/* Gráfico de Barras */}
                <div style={{ width: '100%', height: 300, marginBottom: 24 }}>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={generalStats.promedioCompatibilidadPorTipo}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='tipoCarrera' />
                      <YAxis
                        label={{
                          value: 'Compatibilidad (%)',
                          angle: -90,
                          position: 'insideLeft',
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey='promedioCompatibilidad'
                        name='Promedio'
                        fill='#6a4bd8'
                      />
                      <Bar
                        dataKey='maxCompatibilidad'
                        name='Máxima'
                        fill='#8b5cf6'
                      />
                      <Bar
                        dataKey='minCompatibilidad'
                        name='Mínima'
                        fill='#a78bfa'
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tipo de Carrera</th>
                      <th>Promedio</th>
                      <th>Máxima</th>
                      <th>Mínima</th>
                      <th>Tests</th>
                      <th>Carreras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalStats.promedioCompatibilidadPorTipo.map(item => (
                      <tr key={item.idTipoCarrera}>
                        <td>{item.tipoCarrera}</td>
                        <td>{item.promedioCompatibilidad.toFixed(2)}%</td>
                        <td>{item.maxCompatibilidad.toFixed(2)}%</td>
                        <td>{item.minCompatibilidad.toFixed(2)}%</td>
                        <td>{item.cantidadTests}</td>
                        <td>{item.cantidadCarreras}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Ranking de Carreras Favoritas */}
            {generalStats.rankingFavoritas.length > 0 && (
              <div className={styles.section}>
                <h3>Ranking de Carreras Favoritas</h3>

                {/* Gráfico de Pastel */}
                <div style={{ width: '100%', height: 350, marginBottom: 24 }}>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={generalStats.rankingFavoritas}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={entry =>
                          `${entry.nombreCarrera}: ${entry.totalFavoritos}`
                        }
                        outerRadius={120}
                        fill='#8884d8'
                        dataKey='totalFavoritos'
                      >
                        {generalStats.rankingFavoritas.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Posición</th>
                      <th>Carrera</th>
                      <th>Total Favoritos</th>
                      <th>% del Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalStats.rankingFavoritas.map((item, index) => (
                      <tr key={item.idCarreraInstitucion}>
                        <td>{index + 1}</td>
                        <td>{item.nombreCarrera}</td>
                        <td>{item.totalFavoritos}</td>
                        <td>{item.porcentajeDelTotal}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Ranking por Máxima Compatibilidad */}
            {generalStats.rankingMaxCompatibilidad.length > 0 && (
              <div className={styles.section}>
                <h3>Ranking por Máxima Compatibilidad</h3>

                {/* Gráfico de Barras */}
                <div style={{ width: '100%', height: 350, marginBottom: 24 }}>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={generalStats.rankingMaxCompatibilidad}
                      layout='vertical'
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis
                        type='number'
                        label={{
                          value: 'Compatibilidad (%)',
                          position: 'insideBottom',
                          offset: -5,
                        }}
                      />
                      <YAxis
                        type='category'
                        dataKey='nombreCarrera'
                        width={90}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey='maxCompatibilidad'
                        name='Máxima'
                        fill='#6a4bd8'
                      />
                      <Bar
                        dataKey='promedioCompatibilidad'
                        name='Promedio'
                        fill='#8b5cf6'
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Posición</th>
                      <th>Carrera</th>
                      <th>Máxima Compatibilidad</th>
                      <th>Promedio</th>
                      <th>Tests</th>
                      <th>Tests Alta Compatibilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalStats.rankingMaxCompatibilidad.map(
                      (item, index) => (
                        <tr key={item.idCarreraInstitucion}>
                          <td>{index + 1}</td>
                          <td>{item.nombreCarrera}</td>
                          <td>{item.maxCompatibilidad.toFixed(2)}%</td>
                          <td>{item.promedioCompatibilidad.toFixed(2)}%</td>
                          <td>{item.cantidadTests}</td>
                          <td>{item.testsAltaCompatibilidad}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noData}>
            <p>
              Selecciona un rango de fechas y haz clic en "Buscar" para ver las
              estadísticas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
