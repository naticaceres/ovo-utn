import { useNavigate } from 'react-router-dom';
import styles from './StudentHomePage.module.css';

export default function StudentHomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* Acciones principales */}
      <div className={styles.grid}>
        <div
          className={styles.gridItem}
          onClick={() => navigate('/app/questionnaire')}
        >
          <span className={styles.icon}>📝</span>
          <span className={styles.label}>Realizar Test</span>
        </div>
        <div
          className={styles.gridItem}
          onClick={() => navigate('/app/profile')}
        >
          <span className={styles.icon}>👤</span>
          <span className={styles.label}>Ver Perfil</span>
        </div>
        <div
          className={styles.gridItem}
          onClick={() => navigate('/app/statistics')}
        >
          <span className={styles.icon}>📊</span>
          <span className={styles.label}>Ver Estadísticas</span>
        </div>
        <div
          className={styles.gridItem}
          onClick={() => navigate('/app/careers')}
        >
          <span className={styles.icon}>🔍</span>
          <span className={styles.label}>Consultar Carreras</span>
        </div>
        <div
          className={styles.gridItem}
          onClick={() => navigate('/app/consultar-institucion')}
        >
          <span className={styles.icon}>📖</span>
          <span className={styles.label}>Consultar Institución</span>
        </div>
      </div>
    </div>
  );
}
