import { useQuery } from '@tanstack/react-query';
import {
  getTestResults,
  getUserTests,
  type TestResultsResponse,
  type CarreraRecomendada,
} from '../../context/api';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styles from './ResultsPage.module.css';
import { useAuth } from '../../context/use-auth';
import { useState, useEffect } from 'react';

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

  if (isLoadingCurrentTest || isLoadingUserTests) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Analizando tus respuestas...</p>
      </div>
    );
  }

  if (!displayResults) {
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.resultsCard}>
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

          {!displayResults ||
          !displayResults.carrerasRecomendadas ||
          displayResults.carrerasRecomendadas.length === 0 ? (
            <p className={styles.noResults}>
              No hay carreras recomendadas disponibles.
            </p>
          ) : (
            <div className={styles.recommendationsList}>
              {displayResults.carrerasRecomendadas
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
