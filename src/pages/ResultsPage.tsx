import { useQuery } from '@tanstack/react-query';
import { resultsApi } from '@/lib/api';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import styles from './ResultsPage.module.css';

export function ResultsPage() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: resultsApi.getRecommendations,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Analizando tus respuestas...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
            <div className={styles.aptitudeGrid}>
              <div className={styles.aptitudeItem}>
                <div className={styles.aptitudeIcon}>🧮</div>
                <h3>Matemáticas</h3>
                <div className={styles.aptitudeBar}>
                  <div
                    className={styles.aptitudeFill}
                    style={{ width: '85%' }}
                  ></div>
                </div>
                <span>85%</span>
              </div>

              <div className={styles.aptitudeItem}>
                <div className={styles.aptitudeIcon}>🔬</div>
                <h3>Ciencias</h3>
                <div className={styles.aptitudeBar}>
                  <div
                    className={styles.aptitudeFill}
                    style={{ width: '78%' }}
                  ></div>
                </div>
                <span>78%</span>
              </div>

              <div className={styles.aptitudeItem}>
                <div className={styles.aptitudeIcon}>💻</div>
                <h3>Tecnología</h3>
                <div className={styles.aptitudeBar}>
                  <div
                    className={styles.aptitudeFill}
                    style={{ width: '92%' }}
                  ></div>
                </div>
                <span>92%</span>
              </div>

              <div className={styles.aptitudeItem}>
                <div className={styles.aptitudeIcon}>🎨</div>
                <h3>Arte</h3>
                <div className={styles.aptitudeBar}>
                  <div
                    className={styles.aptitudeFill}
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <span>65%</span>
              </div>
            </div>
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
                    <div className={styles.recommendationRank}>
                      #{index + 1}
                    </div>
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
            <Link to='/'>
              <Button variant='primary' size='lg'>
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
