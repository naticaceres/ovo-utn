import { useQuery } from '@tanstack/react-query';
import { resultsApi, getTestResults } from '../../context/api';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ResultsPage.module.css';
import { useAuth } from '../../context/use-auth';
import { useState, useEffect } from 'react';

export function ResultsPage() {
  const { data: recommendations, isLoading: isLoadingRecommendations } =
    useQuery({
      queryKey: ['recommendations'],
      queryFn: resultsApi.getRecommendations,
    });

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [testId, setTestId] = useState<string | null>(null);
  const [finalScores, setFinalScores] = useState<Record<string, number> | null>(
    null
  );

  // Obtener el testId del localStorage y verificar autenticación
  useEffect(() => {
    const savedTestId = localStorage.getItem('testId');
    const pendingTestId = localStorage.getItem('pendingTestId');
    const userIdAnonimo = localStorage.getItem('userIdAnonimo');

    // Si hay un testId pendiente (usuario volvió después del login), usarlo
    if (pendingTestId && user) {
      setTestId(pendingTestId);
      return;
    }

    if (savedTestId) {
      setTestId(savedTestId);

      // Si no hay usuario logueado pero hay datos del test, redirigir al login
      if (!user && userIdAnonimo) {
        // Guardar datos necesarios para después del login
        localStorage.setItem('pendingTestId', savedTestId);
        localStorage.setItem('pendingUserIdAnonimo', userIdAnonimo);

        // Redirigir al login
        navigate('/app/login');
        return;
      }
    }
  }, [user, navigate]);

  // Obtener los resultados del test usando el nuevo endpoint
  const { data: testResults, isLoading: isLoadingResults } = useQuery({
    queryKey: ['testResults', testId],
    queryFn: () => getTestResults(testId!),
    enabled: !!testId, // Solo ejecutar si tenemos testId
  });

  // Convertir los resultados del nuevo formato al formato esperado
  useEffect(() => {
    if (testResults?.results) {
      // Convertir strings a números
      const scores: Record<string, number> = {};
      Object.entries(testResults.results).forEach(([key, value]) => {
        scores[key] = parseFloat(value) || 0;
      });
      setFinalScores(scores);
    } else {
      // Fallback: intentar cargar desde localStorage (compatibilidad)
      try {
        const savedScores = localStorage.getItem('final_scores');
        if (savedScores) {
          setFinalScores(JSON.parse(savedScores));
        }
      } catch (error) {
        console.error('Error al cargar las puntuaciones:', error);
      }
    }
  }, [testResults]);

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

  if (isLoadingRecommendations || isLoadingResults) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Analizando tus respuestas...</p>
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
          {!finalScores ? (
            <p className={styles.noResults}>
              No se encontraron resultados del test. Por favor, completa el
              cuestionario primero.
            </p>
          ) : (
            <div className={styles.aptitudeGrid}>
              {Object.entries(finalScores).map(([aptitude, score]) => {
                // Manejar casos donde el score no es un número válido
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
              })}
            </div>
          )}
        </div>

        <div className={styles.recommendationsSection}>
          <h2 className={styles.sectionTitle}>Carreras Recomendadas</h2>

          {!recommendations ? (
            <p className={styles.noResults}>
              No hay recomendaciones disponibles en este momento.
            </p>
          ) : (
            <div className={styles.recommendationsList}>
              {recommendations.map((rec, index) => (
                <div key={rec.id} className={styles.recommendationItem}>
                  <div className={styles.recommendationRank}>#{index + 1}</div>
                  <div className={styles.recommendationContent}>
                    <h3 className={styles.careerTitle}>{rec.career}</h3>
                    <p className={styles.universityName}>{rec.university}</p>
                  </div>
                  <div className={styles.recommendationActions}>
                    <a
                      href={rec.link}
                      target='_blank'
                      rel='noreferrer'
                      className={styles.externalLink}
                    >
                      Ver más
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.actionsSection}>
          <Link to='/app/questionnaire'>
            <Button variant='outline' size='lg'>
              Volver al Cuestionario
            </Button>
          </Link>
          {!user && (
            <Link to='/'>
              <Button variant='primary' size='lg'>
                Volver al Inicio
              </Button>
            </Link>
          )}
          {user && (
            <Link to='/app/student' onClick={logout}>
              <Button variant='primary' size='lg'>
                Volver al Inicio
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
