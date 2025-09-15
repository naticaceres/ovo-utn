import { useNavigate } from 'react-router-dom';
import styles from './InstitucionHomePage.module.css';

export default function InstitucionHomePage() {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div
          className={styles.gridItem}
          onClick={() => navigate('/app/institucion/profile')}
        >
          <span className={styles.icon}>👤</span>
          <span className={styles.label}>Ver Perfil</span>
        </div>
        <div
          className={styles.gridItem}
          onClick={() => navigate('/app/estadisticas')}
        >
          <span className={styles.icon}>📊</span>
          <span className={styles.label}>Ver Estadísticas</span>
        </div>
        <div
          className={styles.gridItem}
          onClick={() => navigate('/app/institucion/mis-carreras')}
        >
          <span className={styles.icon}>📚</span>
          <span className={styles.label}>Mis Carreras</span>
        </div>
        <div
          className={styles.gridItem}
          onClick={() => navigate('/app/detalle-institucion')}
        >
          <span className={styles.icon}>🏫</span>
          <span className={styles.label}>Ver Institución</span>
        </div>
      </div>
      {/* Puedes agregar aquí un gráfico o resumen si lo necesitas */}
    </div>
  );
}
