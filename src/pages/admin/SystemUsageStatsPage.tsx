import { useState, useEffect } from 'react';
import { BackButton } from '../../components/ui/BackButton';
import {
  getSystemStats,
  downloadSystemStatsCSV,
  downloadSystemStatsPDF,
  type SystemStatsResponse,
} from '../../services/statistics';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './StatsPages.module.css';

// Colores para los gráficos
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
];

/**
 * Página de estadísticas de Uso y funcionamiento del sistema
 * US023 - Criterios de aceptación: Ver Uso y funcionamiento del sistema
 */
export default function SystemUsageStatsPage() {
  const token = localStorage.getItem('token') || undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<SystemStatsResponse | null>(null);
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
    params.from = fechaDesde;
    params.to = fechaHasta;

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
      const data = await getSystemStats(params, token);
      setStatsData(data);

      // Verificar si no hay resultados (ERR1)
      if (
        !data ||
        (data.usuariosPorTipo.length === 0 &&
          data.evolucionRegistros.length === 0 &&
          data.testsCompletados.length === 0 &&
          data.carrerasPorTipo.length === 0)
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
        await downloadSystemStatsCSV(filtrosAplicados, token);
      } else {
        await downloadSystemStatsPDF(filtrosAplicados, token);
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
        <h1>Uso y funcionamiento del sistema</h1>
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
          {/* Tarjetas de resumen */}
          <div className={styles.statsGrid}>
            {/* Total de usuarios registrados por tipo */}
            <div className={styles.statCard}>
              <div className={styles.statTitle}>Total de usuarios</div>
              <div className={styles.statValue}>
                {statsData.usuariosPorTipo?.reduce(
                  (acc: number, item: { total?: number }) =>
                    acc + (item.total || 0),
                  0
                ) || 0}
              </div>
              <div className={styles.statSubtext}>
                Usuarios registrados en el periodo
              </div>
            </div>

            {/* Tests completados */}
            <div className={styles.statCard}>
              <div className={styles.statTitle}>Tests completados</div>
              <div className={styles.statValue}>
                {statsData.testsCompletados?.reduce(
                  (acc: number, item: { total?: number }) =>
                    acc + (item.total || 0),
                  0
                ) || 0}
              </div>
              <div className={styles.statSubtext}>
                En el periodo seleccionado
              </div>
            </div>

            {/* Total de carreras */}
            <div className={styles.statCard}>
              <div className={styles.statTitle}>Carreras cargadas</div>
              <div className={styles.statValue}>
                {statsData.carrerasPorTipo?.reduce(
                  (acc: number, item: { total?: number }) =>
                    acc + (item.total || 0),
                  0
                ) || 0}
              </div>
              <div className={styles.statSubtext}>Total por tipo</div>
            </div>

            {/* Tasa de actividad */}
            {statsData.actividad && (
              <div className={styles.statCard}>
                <div className={styles.statTitle}>Tasa de actividad</div>
                <div className={styles.statValue}>
                  {((statsData.actividad.tasaActividad || 0) * 100).toFixed(1)}%
                </div>
                <div className={styles.statSubtext}>
                  {statsData.actividad.usuariosActivos || 0} activos de{' '}
                  {statsData.actividad.totalUsuarios || 0}
                </div>
              </div>
            )}
          </div>

          {/* Usuarios por tipo */}
          {statsData.usuariosPorTipo &&
            statsData.usuariosPorTipo.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>
                  Total de usuarios registrados por tipo
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={statsData.usuariosPorTipo}
                      dataKey='total'
                      nameKey='tipo'
                      cx='50%'
                      cy='50%'
                      outerRadius={100}
                      label={entry => `${entry.tipo}: ${entry.total}`}
                    >
                      {statsData.usuariosPorTipo.map(
                        (_: unknown, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

          {/* Evolución de registros */}
          {statsData.evolucionRegistros &&
            statsData.evolucionRegistros.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>
                  Evolución de registros en el tiempo
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={statsData.evolucionRegistros}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='periodo' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='total'
                      stroke='#8884d8'
                      strokeWidth={2}
                      name='Registros'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

          {/* Tests completados por mes */}
          {statsData.testsCompletados &&
            statsData.testsCompletados.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>
                  Tests completados por mes
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={statsData.testsCompletados}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='mes' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey='total'
                      fill='#00C49F'
                      name='Tests completados'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

          {/* Carreras por tipo */}
          {statsData.carrerasPorTipo &&
            statsData.carrerasPorTipo.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>
                  Total de carreras cargadas por tipo
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={statsData.carrerasPorTipo} layout='vertical'>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis dataKey='tipo' type='category' width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='total' fill='#FFBB28' name='Carreras' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

          {/* Estado de solicitudes de instituciones */}
          {statsData.institucionesEstado &&
            statsData.institucionesEstado.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>
                  Estado de solicitudes de Instituciones
                </div>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Indicador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.institucionesEstado.map(
                        (
                          item: { estado: string; total: number },
                          idx: number
                        ) => {
                          let badgeClass = styles.badgeInfo;
                          if (
                            item.estado?.toLowerCase().includes('aprobad') ||
                            item.estado?.toLowerCase().includes('activ')
                          ) {
                            badgeClass = styles.badgeSuccess;
                          } else if (
                            item.estado?.toLowerCase().includes('pendiente')
                          ) {
                            badgeClass = styles.badgeWarning;
                          } else if (
                            item.estado?.toLowerCase().includes('rechazad')
                          ) {
                            badgeClass = styles.badgeDanger;
                          }

                          return (
                            <tr key={idx}>
                              <td>{item.estado || 'No especificado'}</td>
                              <td>{item.total || 0}</td>
                              <td>
                                <span className={badgeClass}>
                                  {item.estado || 'N/D'}
                                </span>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
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
