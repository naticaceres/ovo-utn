import { useQuery } from '@tanstack/react-query';
import {
  getTestResults,
  getUserTests,
  type TestResultsResponse,
  type CarreraRecomendada,
} from '../../context/api';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styles from './ResultsPage.module.css';
import { useAuth } from '../../context/use-auth';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '../../components/ui/Input';
import {
  listCountries,
  listProvinces,
  listLocalities,
  listModalities,
} from '../../services/admin';
import { getCareerInstitutionById } from '../../services/careers';

/**
 * Página de Resultados del Test Vocacional
 * ACCESO PÚBLICO: Disponible para todos los usuarios autenticados
 * No requiere permisos específicos - Solo autenticación
 * Muestra resultados de tests actuales o históricos
 */
export function ResultsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { testId: urlTestId } = useParams<{ testId?: string }>();
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);

  // Estados para filtros
  const [filterPais, setFilterPais] = useState('');
  const [filterProvincia, setFilterProvincia] = useState('');
  const [filterLocalidad, setFilterLocalidad] = useState('');
  const [filterModalidad, setFilterModalidad] = useState('');
  const [filterMontoMin, setFilterMontoMin] = useState('');
  const [filterMontoMax, setFilterMontoMax] = useState('');
  const [filterDuracion, setFilterDuracion] = useState('');
  const [filterTitulo, setFilterTitulo] = useState('');
  const [filterNombreCarrera, setFilterNombreCarrera] = useState('');

  // Estados para listas de opciones
  const [paises, setPaises] = useState<
    Array<{ idPais: string | number; nombrePais: string }>
  >([]);
  const [provincias, setProvincias] = useState<
    Array<{ idProvincia: string | number; nombreProvincia: string }>
  >([]);
  const [localidades, setLocalidades] = useState<
    Array<{ idLocalidad: string | number; nombreLocalidad: string }>
  >([]);
  const [modalidades, setModalidades] = useState<
    Array<{
      idModalidadCarreraInstitucion: string | number;
      nombreModalidad: string;
    }>
  >([]);

  // Estado para detalles completos de carreras (con info de institución para filtrar)
  const [carrerasDetalles, setCarrerasDetalles] = useState<
    Map<number, Record<string, unknown>>
  >(new Map());
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  // Verificar autenticación (solo requiere estar logueado, sin permisos específicos)
  useEffect(() => {
    if (!user) {
      // Si no está autenticado, redirigir al login
      navigate('/app/login');
      return;
    }

    // Prioridad 1: testId desde la URL (cuando viene del historial)
    if (urlTestId) {
      setCurrentTestId(parseInt(urlTestId, 10));
      return;
    }

    // Prioridad 2: testId desde localStorage (cuando acaba de completar un test)
    const savedTestId = localStorage.getItem('testId');
    if (savedTestId) {
      setCurrentTestId(parseInt(savedTestId, 10));
    }
  }, [user, navigate, urlTestId]);

  // Cargar lista de países
  useEffect(() => {
    async function loadPaises() {
      try {
        const data = await listCountries({ includeInactive: 1 });
        const paisesArray = Array.isArray(data)
          ? data.map(p => ({
              idPais: p.id,
              nombrePais: p.nombre,
            }))
          : [];
        setPaises(paisesArray);
      } catch (error) {
        console.error('Error cargando países:', error);
      }
    }
    loadPaises();
  }, []);

  // Cargar lista de modalidades
  useEffect(() => {
    async function loadModalidades() {
      try {
        const data = await listModalities({ includeInactive: 1 });
        const modalidadesArray = Array.isArray(data)
          ? data.map(m => ({
              idModalidadCarreraInstitucion: m.id,
              nombreModalidad: m.nombre,
            }))
          : [];
        setModalidades(modalidadesArray);
      } catch (error) {
        console.error('Error cargando modalidades:', error);
      }
    }
    loadModalidades();
  }, []);

  // Cargar provincias cuando se selecciona un país
  useEffect(() => {
    async function loadProvincias() {
      if (!filterPais) {
        setProvincias([]);
        setFilterProvincia('');
        setLocalidades([]);
        setFilterLocalidad('');
        return;
      }
      try {
        const data = await listProvinces({
          idPais: filterPais,
          includeInactive: 1,
        });
        const provinciasArray = Array.isArray(data)
          ? data.map(p => ({
              idProvincia: p.id,
              nombreProvincia: p.nombre,
            }))
          : [];
        setProvincias(provinciasArray);
        setFilterProvincia('');
        setLocalidades([]);
        setFilterLocalidad('');
      } catch (error) {
        console.error('Error cargando provincias:', error);
      }
    }
    loadProvincias();
  }, [filterPais]);

  // Cargar localidades cuando se selecciona una provincia
  useEffect(() => {
    async function loadLocalidades() {
      if (!filterProvincia) {
        setLocalidades([]);
        setFilterLocalidad('');
        return;
      }
      try {
        const data = await listLocalities({
          idProvincia: filterProvincia,
          includeInactive: 1,
        });
        const localidadesArray = Array.isArray(data)
          ? data.map(l => ({
              idLocalidad: l.id,
              nombreLocalidad: l.nombre,
            }))
          : [];
        setLocalidades(localidadesArray);
        setFilterLocalidad('');
      } catch (error) {
        console.error('Error cargando localidades:', error);
      }
    }
    loadLocalidades();
  }, [filterProvincia]);

  // Obtener los resultados del test actual (solo si no viene de la URL)
  const { data: currentTestResults, isLoading: isLoadingCurrentTest } =
    useQuery({
      queryKey: ['currentTestResults', currentTestId],
      queryFn: async () => {
        if (!currentTestId) return null;
        const results = await getTestResults(currentTestId);
        // Limpiar localStorage después de obtener los resultados (solo si no viene de URL)
        if (!urlTestId) {
          localStorage.removeItem('testId');
        }
        return results;
      },
      enabled: !!currentTestId && !!user && !urlTestId,
    });

  // Obtener historial de tests del usuario
  const { data: userTests, isLoading: isLoadingUserTests } = useQuery({
    queryKey: ['userTests'],
    queryFn: getUserTests,
    enabled: !!user,
  });

  // Determinar los datos a mostrar
  const displayResults: TestResultsResponse | null = urlTestId
    ? // Si viene de la URL, buscar en el historial
      (userTests?.find(
        test => test.testId === parseInt(urlTestId, 10)
      ) as TestResultsResponse) || null
    : // Si no, usar los resultados actuales o el más reciente del historial
      currentTestResults ||
      ((userTests && userTests.length > 0
        ? userTests[0]
        : null) as TestResultsResponse | null);

  // Cargar detalles de carreras cuando displayResults cambia
  useEffect(() => {
    async function loadCarrerasDetalles() {
      if (!displayResults?.carrerasRecomendadas) return;

      setLoadingDetalles(true);
      const detallesMap = new Map<number, Record<string, unknown>>();

      try {
        // Cargar detalles de cada carrera en paralelo
        const promises = displayResults.carrerasRecomendadas.map(
          async (carrera: CarreraRecomendada) => {
            try {
              // Usar idCarreraInstitucion para obtener los detalles completos
              const detalle = await getCareerInstitutionById(
                carrera.idCarreraInstitucion
              );
              return { id: carrera.idCarreraInstitucion, detalle };
            } catch (error) {
              console.error(
                `Error cargando detalle de carrera ${carrera.idCarreraInstitucion}:`,
                error
              );
              return { id: carrera.idCarreraInstitucion, detalle: null };
            }
          }
        );

        const results = await Promise.all(promises);
        results.forEach(({ id, detalle }) => {
          if (detalle) {
            detallesMap.set(id, detalle as Record<string, unknown>);
          }
        });

        setCarrerasDetalles(detallesMap);
      } catch (error) {
        console.error('Error cargando detalles de carreras:', error);
      } finally {
        setLoadingDetalles(false);
      }
    }

    loadCarrerasDetalles();
  }, [displayResults]);

  // Función para obtener un icono aleatorio para cada aptitud
  const getRandomIcon = (aptitude: string) => {
    const icons = [
      '🧮',
      '🔬',
      '💻',
      '🎨',
      '📊',
      '🔧',
      '💡',
      '🎯',
      '⚡',
      '🌟',
      '🚀',
      '🎪',
      '🎭',
      '🎨',
      '📈',
      '🔍',
      '💼',
      '🎓',
      '🏆',
      '⭐',
    ];
    const index =
      aptitude.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      icons.length;
    return icons[index];
  };

  // Función para obtener un color aleatorio para cada aptitud
  const getRandomColor = (aptitude: string) => {
    const colors = [
      '#8b5cf6',
      '#06b6d4',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#ec4899',
      '#84cc16',
      '#f97316',
      '#6366f1',
      '#14b8a6',
    ];
    const index =
      aptitude.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  // Filtrar carreras recomendadas usando los detalles cargados
  const filteredCarreras = useMemo(() => {
    if (!displayResults?.carrerasRecomendadas) return [];

    return displayResults.carrerasRecomendadas.filter(
      (carrera: CarreraRecomendada) => {
        // Filtro por nombre de carrera
        if (
          filterNombreCarrera &&
          !carrera.nombreCarrera
            ?.toLowerCase()
            .includes(filterNombreCarrera.toLowerCase())
        ) {
          return false;
        }

        // Filtro por título
        if (
          filterTitulo &&
          !carrera.tituloCarrera
            ?.toLowerCase()
            .includes(filterTitulo.toLowerCase())
        ) {
          return false;
        }

        // Obtener detalles de la carrera para filtros avanzados
        const detalle = carrerasDetalles.get(carrera.idCarreraInstitucion);
        if (!detalle) {
          // Si no hay detalles cargados aún, solo aplicar filtros básicos
          return true;
        }

        // Extraer datos de la estructura del detalle
        // Estructura esperada: { institucion: {...}, carreraInstitucion: {...} }
        const institucion = detalle.institucion as
          | Record<string, unknown>
          | undefined;
        const carreraInstitucion = detalle.carreraInstitucion as
          | Record<string, unknown>
          | undefined;

        // Filtro por país
        if (filterPais && institucion?.idPais !== undefined) {
          const idPais = String(institucion.idPais);
          if (idPais !== filterPais) {
            return false;
          }
        }

        // Filtro por provincia
        if (filterProvincia && institucion?.idProvincia !== undefined) {
          const idProvincia = String(institucion.idProvincia);
          if (idProvincia !== filterProvincia) {
            return false;
          }
        }

        // Filtro por localidad
        if (filterLocalidad && institucion?.idLocalidad !== undefined) {
          const idLocalidad = String(institucion.idLocalidad);
          if (idLocalidad !== filterLocalidad) {
            return false;
          }
        }

        // Filtro por modalidad
        if (filterModalidad && carreraInstitucion?.modalidad) {
          const modalidad = String(carreraInstitucion.modalidad);
          if (modalidad !== filterModalidad) {
            return false;
          }
        }

        // Filtro por monto mínimo
        if (filterMontoMin && carreraInstitucion?.montoCuota !== undefined) {
          const montoCuota = Number(carreraInstitucion.montoCuota);
          const minimo = Number(filterMontoMin);
          if (montoCuota < minimo) {
            return false;
          }
        }

        // Filtro por monto máximo
        if (filterMontoMax && carreraInstitucion?.montoCuota !== undefined) {
          const montoCuota = Number(carreraInstitucion.montoCuota);
          const maximo = Number(filterMontoMax);
          if (montoCuota > maximo) {
            return false;
          }
        }

        // Filtro por duración
        if (filterDuracion && carreraInstitucion?.duracion !== undefined) {
          const duracion = Number(carreraInstitucion.duracion);
          const duracionFiltro = Number(filterDuracion);
          if (duracion !== duracionFiltro) {
            return false;
          }
        }

        return true;
      }
    );
  }, [
    displayResults,
    carrerasDetalles,
    filterNombreCarrera,
    filterTitulo,
    filterPais,
    filterProvincia,
    filterLocalidad,
    filterModalidad,
    filterMontoMin,
    filterMontoMax,
    filterDuracion,
  ]);

  const clearFilters = () => {
    setFilterPais('');
    setFilterProvincia('');
    setFilterLocalidad('');
    setFilterModalidad('');
    setFilterMontoMin('');
    setFilterMontoMax('');
    setFilterDuracion('');
    setFilterTitulo('');
    setFilterNombreCarrera('');
  };

  const hasActiveFilters =
    filterPais ||
    filterProvincia ||
    filterLocalidad ||
    filterModalidad ||
    filterMontoMin ||
    filterMontoMax ||
    filterDuracion ||
    filterTitulo ||
    filterNombreCarrera;

  if (isLoadingCurrentTest || isLoadingUserTests) {
    return (
      <div className={styles.loadingContainer}>
        <BackButton />
        <div className={styles.loadingSpinner} />
        <p>Analizando tus respuestas...</p>
      </div>
    );
  }

  if (!displayResults) {
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.resultsCard}>
          <BackButton />
          <header className={styles.header}>
            <h1 className={styles.title}>No hay resultados disponibles</h1>
            <p className={styles.subtitle}>
              Completa el test vocacional para ver tus resultados
            </p>
          </header>
          <div className={styles.actionsSection}>
            <Link to='/app/questionnaire'>
              <Button variant='primary' size='lg'>
                Realizar Test
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsCard}>
        <BackButton />
        <header className={styles.header}>
          <h1 className={styles.title}>Tus Resultados Vocacionales</h1>
          <p className={styles.subtitle}>
            Basado en tus respuestas, aquí tienes las carreras que mejor se
            adaptan a tu perfil
          </p>
        </header>

        <div className={styles.aptitudeMap}>
          <h2 className={styles.sectionTitle}>Mapa de Aptitudes</h2>
          {!displayResults || !displayResults.aptitudesObtenidas ? (
            <p className={styles.noResults}>
              No se encontraron resultados de aptitudes.
            </p>
          ) : (
            <div className={styles.aptitudeGrid}>
              {(() => {
                const aptitudes = displayResults.aptitudesObtenidas;

                // Si es un array (nuevo formato del API)
                if (Array.isArray(aptitudes)) {
                  return aptitudes.map(apt => {
                    const percentage = Math.max(
                      0,
                      Math.min(100, Math.round(apt.afinidadAptitud * 10))
                    );
                    const icon = getRandomIcon(apt.nombreAptitud);
                    const color = getRandomColor(apt.nombreAptitud);

                    return (
                      <div key={apt.idAptitud} className={styles.aptitudeItem}>
                        <div
                          className={styles.aptitudeIcon}
                          style={{ backgroundColor: color }}
                        >
                          {icon}
                        </div>
                        <h3>{apt.nombreAptitud}</h3>
                        <div className={styles.aptitudeBar}>
                          <div
                            className={styles.aptitudeFill}
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: color,
                            }}
                          ></div>
                        </div>
                        <span>{percentage}%</span>
                      </div>
                    );
                  });
                }

                // Si es un objeto (formato antiguo)
                return Object.entries(aptitudes).map(([aptitude, score]) => {
                  const numericScore =
                    typeof score === 'number' && !isNaN(score) ? score : 0;
                  const percentage = Math.max(
                    0,
                    Math.min(100, Math.round((numericScore / 10) * 100))
                  );
                  const icon = getRandomIcon(aptitude);
                  const color = getRandomColor(aptitude);

                  return (
                    <div key={aptitude} className={styles.aptitudeItem}>
                      <div
                        className={styles.aptitudeIcon}
                        style={{ backgroundColor: color }}
                      >
                        {icon}
                      </div>
                      <h3>{aptitude}</h3>
                      <div className={styles.aptitudeBar}>
                        <div
                          className={styles.aptitudeFill}
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: color,
                          }}
                        ></div>
                      </div>
                      <span>{percentage}%</span>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        <div className={styles.recommendationsSection}>
          <h2 className={styles.sectionTitle}>Carreras Recomendadas</h2>

          {/* Filtros */}
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                🔍 Filtrar Carreras
              </h3>
              {loadingDetalles && (
                <span style={{ fontSize: '14px', color: '#666' }}>
                  ⏳ Cargando detalles...
                </span>
              )}
              {hasActiveFilters && (
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  style={{ fontSize: '12px', padding: '4px 12px' }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >
              {/* Filtro por País */}
              <div>
                <label
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '4px',
                    display: 'block',
                  }}
                >
                  País
                </label>
                <select
                  value={filterPais}
                  onChange={e => setFilterPais(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value=''>Todos los países</option>
                  {paises.map(p => (
                    <option key={p.idPais} value={p.idPais}>
                      {p.nombrePais}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Provincia */}
              <div>
                <label
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '4px',
                    display: 'block',
                  }}
                >
                  Provincia/Estado
                </label>
                <select
                  value={filterProvincia}
                  onChange={e => setFilterProvincia(e.target.value)}
                  disabled={!filterPais}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value=''>Todas las provincias</option>
                  {provincias.map(p => (
                    <option key={p.idProvincia} value={p.idProvincia}>
                      {p.nombreProvincia}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Localidad */}
              <div>
                <label
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '4px',
                    display: 'block',
                  }}
                >
                  Localidad/Ciudad
                </label>
                <select
                  value={filterLocalidad}
                  onChange={e => setFilterLocalidad(e.target.value)}
                  disabled={!filterProvincia}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value=''>Todas las localidades</option>
                  {localidades.map(l => (
                    <option key={l.idLocalidad} value={l.idLocalidad}>
                      {l.nombreLocalidad}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Modalidad */}
              <div>
                <label
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '4px',
                    display: 'block',
                  }}
                >
                  Modalidad
                </label>
                <select
                  value={filterModalidad}
                  onChange={e => setFilterModalidad(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value=''>Todas las modalidades</option>
                  {modalidades.map(m => (
                    <option
                      key={m.idModalidadCarreraInstitucion}
                      value={m.nombreModalidad}
                    >
                      {m.nombreModalidad}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Nombre de Carrera */}
              <Input
                label='Nombre de Carrera'
                placeholder='Buscar por nombre...'
                value={filterNombreCarrera}
                onChange={e => setFilterNombreCarrera(e.target.value)}
                fullWidth
              />

              {/* Filtro por Título */}
              <Input
                label='Título'
                placeholder='Buscar por título...'
                value={filterTitulo}
                onChange={e => setFilterTitulo(e.target.value)}
                fullWidth
              />

              {/* Filtro por Monto Mínimo */}
              <Input
                label='Cuota Mínima ($/mes)'
                type='number'
                placeholder='0'
                value={filterMontoMin}
                onChange={e => setFilterMontoMin(e.target.value)}
                fullWidth
              />

              {/* Filtro por Monto Máximo */}
              <Input
                label='Cuota Máxima ($/mes)'
                type='number'
                placeholder='Sin límite'
                value={filterMontoMax}
                onChange={e => setFilterMontoMax(e.target.value)}
                fullWidth
              />

              {/* Filtro por Duración */}
              <Input
                label='Duración (años)'
                type='number'
                placeholder='Ej: 4'
                value={filterDuracion}
                onChange={e => setFilterDuracion(e.target.value)}
                fullWidth
              />
            </div>

            <div style={{ fontSize: '14px', color: '#666' }}>
              Mostrando <strong>{filteredCarreras.length}</strong> de{' '}
              <strong>
                {displayResults.carrerasRecomendadas?.length || 0}
              </strong>{' '}
              carreras
            </div>
          </div>

          {!displayResults ||
          !displayResults.carrerasRecomendadas ||
          displayResults.carrerasRecomendadas.length === 0 ? (
            <p className={styles.noResults}>
              No hay carreras recomendadas disponibles.
            </p>
          ) : filteredCarreras.length === 0 ? (
            <p className={styles.noResults}>
              No hay carreras que coincidan con los filtros aplicados.
            </p>
          ) : (
            <div className={styles.recommendationsList}>
              {filteredCarreras
                .sort(
                  (a: CarreraRecomendada, b: CarreraRecomendada) =>
                    (b.afinidadCarrera || b.puntaje || 0) -
                    (a.afinidadCarrera || a.puntaje || 0)
                )
                .map((carrera: CarreraRecomendada, index: number) => {
                  // Usar afinidadCarrera si existe, sino puntaje, sino 0
                  const compatibilidad =
                    carrera.afinidadCarrera ?? carrera.puntaje ?? 0;

                  return (
                    <div
                      key={carrera.idCarreraInstitucion}
                      className={styles.recommendationItem}
                    >
                      <div className={styles.recommendationRank}>
                        #{index + 1}
                      </div>
                      <div className={styles.recommendationContent}>
                        <h3 className={styles.careerTitle}>
                          {carrera.tituloCarrera}
                        </h3>
                        <p className={styles.universityName}>
                          Compatibilidad: {compatibilidad.toFixed(2)}%
                        </p>
                      </div>
                      <div className={styles.recommendationActions}>
                        <Link
                          to={`/app/student/carrera-detalle/${carrera.idCarreraInstitucion}`}
                        >
                          <Button variant='outline' size='sm'>
                            Ver detalles
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className={styles.actionsSection}>
          <Link to='/app/questionnaire'>
            <Button variant='outline' size='lg'>
              Realizar Otro Test
            </Button>
          </Link>
          {userTests && userTests.length > 1 && (
            <Link to='/app/student/tests'>
              <Button variant='outline' size='lg'>
                Ver Historial de Tests
              </Button>
            </Link>
          )}
          <Link to='/app/student'>
            <Button variant='primary' size='lg'>
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
