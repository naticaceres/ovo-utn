import { useNavigate } from 'react-router-dom';
import styles from './StudentHomePage.module.css';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../context/api';

interface Aptitude {
  label: string;
  value: number;
}

function useStudentAptitudes(userId: number) {
  return useQuery<Aptitude[]>({
    queryKey: ['studentAptitudes', userId],
    queryFn: async () => {
      const { data } = await api.get(`/students/${userId}/aptitudes`);
      return data;
    },
  });
}

function useStudentLastCareer(userId: number) {
  return useQuery<string>({
    queryKey: ['studentLastCareer', userId],
    queryFn: async () => {
      const { data } = await api.get(`/students/${userId}/lastCareer`);
      return data;
    },
  });
}

export default function StudentHomePage() {
  const navigate = useNavigate();
  const user = sessionStorage.getItem('user');
  const userId = user ? JSON.parse(user).id : 0;

  const { data: aptitudes = [], isLoading: loadingApt } =
    useStudentAptitudes(userId);
  const { data: lastCareer, isLoading: loadingCareer } =
    useStudentLastCareer(userId);

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

      {/* Gráfico de aptitudes */}
      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>Último Test - Aptitudes</div>
        <div
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'end',
            minHeight: 180,
          }}
        >
          {(loadingApt
            ? Array(7).fill({ label: '', value: 0 })
            : aptitudes
          ).map((apt, i) => (
            <div key={apt.label || i} style={{ flex: 1, textAlign: 'center' }}>
              <div
                style={{
                  background: 'var(--color-primary)',
                  height: apt.value * 1.5,
                  borderRadius: 8,
                  marginBottom: 8,
                  transition: 'height 0.3s',
                }}
              />
              <div style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
                {apt.label}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.lastCareer}>
          Última carrera marcada como <b>"Me interesa"</b>:{' '}
          <b>{loadingCareer ? 'Cargando...' : lastCareer}</b>
        </div>
      </div>
    </div>
  );
}
