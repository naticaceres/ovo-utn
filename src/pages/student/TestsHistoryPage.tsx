import { useQuery } from '@tanstack/react-query';
import {
  getUserTests,
  getTestResults,
  type UserTest,
  type CarreraRecomendada,
} from '../../context/api';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './TestsHistoryPage.module.css';

/**
 * Página de Historial de Tests Vocacionales
 * ACCESO PÚBLICO: Disponible para todos los usuarios autenticados
 * No requiere permisos específicos - Solo autenticación
 */
export function TestsHistoryPage() {
  const [isAssociatingTest, setIsAssociatingTest] = useState(false);
  const [hasCheckedPendingTest, setHasCheckedPendingTest] = useState(false);

  // Obtener historial de tests del usuario
  // Esta funcionalidad está disponible para todos los usuarios autenticados
  // Solo se ejecuta después de verificar y asociar tests pendientes
  const {
    data: userTests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userTests'],
    queryFn: getUserTests,
    enabled: hasCheckedPendingTest && !isAssociatingTest, // Solo ejecutar después de verificar tests pendientes
  });

  // Verificar y asociar test pendiente antes de cargar el historial
  useEffect(() => {
    const associatePendingTest = async () => {
      // Verificar si hay un testId pendiente en localStorage
      const pendingTestId = localStorage.getItem('testId');

      if (pendingTestId && !hasCheckedPendingTest) {
        setIsAssociatingTest(true);
        try {
          // Llamar al endpoint para asociar el test al usuario autenticado
          await getTestResults(parseInt(pendingTestId, 10));
          console.log('Test asociado exitosamente al usuario');
          // El test ahora está asociado al usuario y aparecerá en el historial
          setHasCheckedPendingTest(true);
          // Refrescar el listado de tests para incluir el recién asociado
          refetch();
        } catch (error) {
          console.error('Error al asociar test pendiente:', error);
          setHasCheckedPendingTest(true);
        } finally {
          setIsAssociatingTest(false);
        }
      } else {
        setHasCheckedPendingTest(true);
      }
    };

    associatePendingTest();
  }, [hasCheckedPendingTest, refetch]);

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

  if (isAssociatingTest || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>
          {isAssociatingTest
            ? 'Registrando test completado...'
            : 'Cargando historial de tests...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error al cargar el historial</h2>
        <p>No se pudo obtener la información de tus tests realizados.</p>
        <Link to='/app/student'>
          <Button variant='primary'>Volver al Inicio</Button>
        </Link>
      </div>
    );
  }

  if (!userTests || userTests.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>No has realizado ningún test</h2>
          <p className={styles.emptyDescription}>
            Realiza tu primer test vocacional para descubrir tus aptitudes y
            carreras compatibles.
          </p>
          <Link to='/app/questionnaire'>
            <Button variant='primary' size='lg'>
              Realizar Test
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.historyContainer}>
      <div className={styles.historyHeader}>
        <h1 className={styles.historyTitle}>Historial de Tests Vocacionales</h1>
        <p className={styles.historySubtitle}>
          Aquí puedes ver todos los tests que has realizado y sus resultados
        </p>
        <div className={styles.historyActions}>
          <Link to='/app/questionnaire'>
            <Button variant='primary'>Realizar Nuevo Test</Button>
          </Link>
          <Link to='/app/student'>
            <Button variant='outline'>Volver al Inicio</Button>
          </Link>
        </div>
      </div>

      <div className={styles.testsList}>
        {userTests.map((test: UserTest, index: number) => (
          <div key={test.testId} className={styles.testCard}>
            <div className={styles.testCardHeader}>
              <div className={styles.testNumber}>
                Test #{userTests.length - index}
              </div>
              {test.fechaRealizacion && (
                <div className={styles.testDate}>
                  {new Date(test.fechaRealizacion).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              )}
            </div>

            <div className={styles.testContent}>
              {/* Aptitudes */}
              <div className={styles.testSection}>
                <h3 className={styles.sectionTitle}>Aptitudes Obtenidas</h3>
                {test.aptitudesObtenidas &&
                Object.keys(test.aptitudesObtenidas).length > 0 ? (
                  <div className={styles.aptitudesGrid}>
                    {Object.entries(test.aptitudesObtenidas)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([aptitude, score]) => {
                        const percentage = Math.max(
                          0,
                          Math.min(100, Math.round((score / 10) * 100))
                        );
                        const icon = getRandomIcon(aptitude);
                        const color = getRandomColor(aptitude);

                        return (
                          <div key={aptitude} className={styles.aptitudeChip}>
                            <span
                              className={styles.aptitudeIcon}
                              style={{ color }}
                            >
                              {icon}
                            </span>
                            <span className={styles.aptitudeName}>
                              {aptitude}
                            </span>
                            <span className={styles.aptitudeScore}>
                              {percentage}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className={styles.noData}>No hay datos de aptitudes</p>
                )}
              </div>

              {/* Carreras Recomendadas */}
              <div className={styles.testSection}>
                <h3 className={styles.sectionTitle}>
                  Top 3 Carreras Recomendadas
                </h3>
                {test.carrerasRecomendadas &&
                test.carrerasRecomendadas.length > 0 ? (
                  <div className={styles.careersList}>
                    {test.carrerasRecomendadas
                      .sort(
                        (a: CarreraRecomendada, b: CarreraRecomendada) =>
                          (b.afinidadCarrera || b.puntaje || 0) -
                          (a.afinidadCarrera || a.puntaje || 0)
                      )
                      .slice(0, 3)
                      .map((carrera: CarreraRecomendada, idx: number) => {
                        // Usar afinidadCarrera si existe, sino puntaje, sino 0
                        const compatibilidad =
                          carrera.afinidadCarrera ?? carrera.puntaje ?? 0;

                        return (
                          <div
                            key={carrera.idCarreraInstitucion}
                            className={styles.careerItem}
                          >
                            <div className={styles.careerRank}>#{idx + 1}</div>
                            <div className={styles.careerInfo}>
                              <h4 className={styles.careerTitle}>
                                {carrera.tituloCarrera}
                              </h4>
                              <p className={styles.careerMatch}>
                                Compatibilidad: {compatibilidad.toFixed(2)}%
                              </p>
                            </div>
                            <Link
                              to={`/app/student/career/${carrera.idCarreraInstitucion}`}
                            >
                              <Button variant='outline' size='sm'>
                                Ver detalles
                              </Button>
                            </Link>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className={styles.noData}>No hay carreras recomendadas</p>
                )}
              </div>
            </div>

            <div className={styles.testCardFooter}>
              <Link to={`/app/student/tests/${test.testId}`}>
                <Button variant='outline' size='sm'>
                  Ver Resultados Completos
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
