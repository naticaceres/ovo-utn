import styles from '../student/StudentHomePage.module.css';
import { ICONS } from '../admin/AdminIcons';

const institucionModules = [
  { id: 1, label: 'Ver Perfil', icon: 'user' },
  { id: 2, label: 'Ver Estadísticas', icon: 'bar-chart' },
  { id: 3, label: 'Mis Carreras', icon: 'book-open' },
  { id: 4, label: 'Ver Institución', icon: 'home' },
];

export default function InstitucionHomePage() {
  return (
    <div className={styles.container}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        {institucionModules.map(mod => (
          <div key={mod.id} className={styles.gridItemSm}>
            {ICONS[mod.icon] || <span className={styles.icon}>🔹</span>}
            <span className={styles.label}>{mod.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
