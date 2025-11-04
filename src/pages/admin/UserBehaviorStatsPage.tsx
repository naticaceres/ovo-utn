import { useState, useEffect } from 'react';
import { BackButton } from '../../components/ui/BackButton';
import {
  getUserBehaviorStats,
  downloadUserBehaviorStatsCSV,
  downloadUserBehaviorStatsPDF,
  type UserBehaviorStatsResponse,
} from '../../services/statistics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './StatsPages.module.css';

/**
 * Página de estadísticas de Comportamiento general de los usuarios
 * US023 - Criterios de aceptación: Ver Comportamiento general de los usuarios
 */
export default function UserBehaviorStatsPage() {
  const token = localStorage.getItem('token') || undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<UserBehaviorStatsResponse | null>(
    null
  );
  const [showExportModal, setShowExportModal] = useState(false);

  // Estados de filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState<{
    fechaDesde?: string;
    fechaHasta?: string;
  }>({});

  // Cargar estadísticas iniciales (sin filtros)
  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validar fechas
  const validateFilters = (): string | null => {
    const hoy = new Date().toISOString().split('T')[0];

    if (fechaHasta && fechaHasta > hoy) {
      return 'La fecha hasta no puede ser superior a la fecha de hoy.';
    }

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      return 'La fecha desde no puede ser posterior a la fecha hasta.';
    }

    return null;
  };

  // Cargar estadísticas con filtros
  const handleBuscar = () => {
    const errorValidacion = validateFilters();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    // Validar que existan ambas fechas
    if (!fechaDesde || !fechaHasta) {
      setError('Debe seleccionar ambas fechas (desde y hasta)');
      return;
    }

    const params: Record<string, string | number> = {};
    params.from = fechaDesde; // Cambiar a 'from'
    params.to = fechaHasta; // Cambiar a 'to'

    // Guardar filtros aplicados para el reporte
    setFiltrosAplicados({
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    });

    loadStats(params);
  };

  // Cargar estadísticas
  const loadStats = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getUserBehaviorStats(params, token);
      setStatsData(data);

      // Verificar si no hay resultados (ERR1)
      if (
        !data ||
        (!data.carrerasFavoritas?.length &&
          !data.topCarrerasCompatibilidad?.length)
      ) {
        setError(
          'No se encontraron resultados. Por favor, cambie los filtros e intente nuevamente.'
        );
      }
    } catch (err) {
      const error = err as { message?: string };
      setError(
        error.message ||
          'Error al cargar las estadísticas. Por favor, intente nuevamente.'
      );
      setStatsData(null);
    } finally {
      setLoading(false);
    }
  };

  // Exportar con el formato seleccionado
  const handleExport = async (format: 'pdf' | 'csv') => {
    setShowExportModal(false);

    if (!filtrosAplicados.fechaDesde || !filtrosAplicados.fechaHasta) {
      setError('Debe aplicar filtros de fecha antes de exportar');
      return;
    }

    try {
      setLoading(true);
      if (format === 'csv') {
        await downloadUserBehaviorStatsCSV(filtrosAplicados, token);
      } else {
        await downloadUserBehaviorStatsPDF(filtrosAplicados, token);
      }
    } catch (err) {
      const error = err as { message?: string };
      setError(
        error.message || 'Error al exportar. Por favor, intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />

      <div className={styles.header}>
        <h1>Comportamiento general de los usuarios</h1>
        {statsData && (
          <button
            className={styles.btnExport}
            onClick={() => setShowExportModal(true)}
          >
            Exportar
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label htmlFor='fechaDesde' className={styles.filterLabel}>
              Fecha desde
            </label>
            <input
              type='date'
              id='fechaDesde'
              className={styles.filterInput}
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor='fechaHasta' className={styles.filterLabel}>
              Fecha hasta
            </label>
            <input
              type='date'
              id='fechaHasta'
              className={styles.filterInput}
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className={styles.filterActions}>
            <button
              className={styles.btnSearch}
              onClick={handleBuscar}
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className={styles.loading}>Cargando estadísticas...</div>
      )}

      {/* Error */}
      {error && !loading && <div className={styles.error}>{error}</div>}

      {/* Resultados */}
      {statsData && !loading && !error && (
        <>
          {/* Carreras más favoritas */}
          {statsData.carrerasFavoritas &&
            statsData.carrerasFavoritas.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>
                  Carreras más marcadas como favoritas (Top 10)
                </div>
                <ResponsiveContainer width='100%' height={400}>
                  <BarChart
                    data={statsData.carrerasFavoritas
                      .slice(0, 10)
                      .map(item => ({
                        ...item,
                        carreraConInstitucion: `${item.carrera} (${item.institucion})`,
                      }))}
                    layout='vertical'
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis
                      dataKey='carreraConInstitucion'
                      type='category'
                      width={250}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey='total'
                      fill='#0088FE'
                      name='Total de favoritos'
                      label={{ position: 'right' }}
                    />
                  </BarChart>
                </ResponsiveContainer>

                {statsData.carrerasFavoritas.length === 0 && (
                  <div className={styles.noData}>
                    No hay carreras marcadas como favoritas en este periodo
                  </div>
                )}
              </div>
            )}

          {/* Top carreras con mayor compatibilidad */}
          {statsData.topCarrerasCompatibilidad &&
            statsData.topCarrerasCompatibilidad.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>
                  Top carreras con mayor promedio de compatibilidad (Top 10)
                </div>
                <ResponsiveContainer width='100%' height={400}>
                  <BarChart
                    data={statsData.topCarrerasCompatibilidad.slice(0, 10)}
                    layout='vertical'
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' domain={[0, 100]} />
                    <YAxis
                      dataKey='nombreCarrera'
                      type='category'
                      width={200}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'Promedio de compatibilidad') {
                          return [`${value.toFixed(2)}%`, name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey='promedioCompatibilidad'
                      fill='#00C49F'
                      name='Promedio de compatibilidad'
                      label={{
                        position: 'right',
                        formatter: (value: number) => `${value.toFixed(1)}%`,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>

                {statsData.topCarrerasCompatibilidad.length === 0 && (
                  <div className={styles.noData}>
                    No hay datos de compatibilidad en este periodo
                  </div>
                )}
              </div>
            )}

          {/* Mensaje si no hay ningún dato */}
          {(!statsData.carrerasFavoritas ||
            statsData.carrerasFavoritas.length === 0) &&
            (!statsData.topCarrerasCompatibilidad ||
              statsData.topCarrerasCompatibilidad.length === 0) && (
              <div className={styles.noData}>
                No se encontraron resultados. Por favor, cambie los filtros e
                intente nuevamente.
              </div>
            )}
        </>
      )}

      {/* Modal de exportación */}
      {showExportModal && (
        <div className={styles.exportModal}>
          <div className={styles.exportModalContent}>
            <div className={styles.exportModalTitle}>
              Seleccionar formato de exportación
            </div>

            <div className={styles.exportOptions}>
              <div
                className={styles.exportOption}
                onClick={() => handleExport('pdf')}
              >
                <span className={styles.exportOptionIcon}>📄</span>
                <span className={styles.exportOptionText}>PDF</span>
              </div>

              <div
                className={styles.exportOption}
                onClick={() => handleExport('csv')}
              >
                <span className={styles.exportOptionIcon}>📊</span>
                <span className={styles.exportOptionText}>CSV</span>
              </div>
            </div>

            <div className={styles.exportModalActions}>
              <button
                className={styles.btnCancel}
                onClick={() => setShowExportModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
