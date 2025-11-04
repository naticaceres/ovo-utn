import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui/BackButton';
import styles from './StatsDashboardPage.module.css';

/**
 * Página principal del tablero de estadísticas
 * US023 - Permite al administrador elegir entre ver estadísticas del sistema o de usuarios
 */
export default function StatsDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <BackButton />

      <div className={styles.header}>
        <h1>Tablero de Estadísticas</h1>
        <p>
          Accede a información detallada sobre el uso del sistema y el
          comportamiento de los usuarios
        </p>
      </div>

      <div className={styles.optionsGrid}>
        <div
          className={styles.optionCard}
          onClick={() => navigate('/app/admin/estadisticas/uso-funcionamiento')}
          role='button'
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/app/admin/estadisticas/uso-funcionamiento');
            }
          }}
        >
          <div className={styles.optionIcon}>📊</div>
          <div>
            <div className={styles.optionTitle}>
              Uso y funcionamiento del sistema
            </div>
            <div className={styles.optionDescription}>
              Visualiza métricas sobre registros de usuarios, tests completados,
              carreras cargadas y estado de solicitudes
            </div>
          </div>
        </div>

        <div
          className={styles.optionCard}
          onClick={() =>
            navigate('/app/admin/estadisticas/comportamiento-usuarios')
          }
          role='button'
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/app/admin/estadisticas/comportamiento-usuarios');
            }
          }}
        >
          <div className={styles.optionIcon}>👥</div>
          <div>
            <div className={styles.optionTitle}>
              Comportamiento general de los usuarios
            </div>
            <div className={styles.optionDescription}>
              Analiza las carreras más favoritas y aquellas con mayor promedio
              de compatibilidad
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
