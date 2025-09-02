import styles from '../student/StudentHomePage.module.css';
import { AdminModules } from './AdminModules';
import { ICONS } from './AdminIcons';

export default function AdminHomePage() {
  const modules = AdminModules;
  const loading = false;

  const mainModules = modules.filter(m => m.category === 'main');
  const gridModules = modules.filter(m => m.category === 'grid');

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
        {mainModules.map(mod => (
          <div key={mod.id} className={styles.gridItemSm}>
            {ICONS[mod.icon] || <span className={styles.icon}>🔹</span>}
            <span className={styles.label}>{mod.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.grid}>
        {loading ? (
          <div>Cargando módulos...</div>
        ) : (
          gridModules.map(mod => (
            <div key={mod.id} className={styles.gridItem}>
              {ICONS[mod.icon] || <span className={styles.icon}>🔹</span>}
              <span className={styles.label}>{mod.label}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
