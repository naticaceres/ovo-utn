import { useNavigate } from 'react-router-dom';
import styles from '../student/StudentHomePage.module.css';
import { ICONS } from './AdminIcons';

const GROUPS = [
  {
    title: 'Gestión de backups',
    items: [
      { id: 'crear-backup', label: 'Crear Backup', icon: 'upload' },
      { id: 'restaurar-backup', label: 'Restaurar Backup', icon: 'download' },
      {
        id: 'consultar-backups',
        label: 'Consultar Backups',
        icon: 'file-text',
      },
    ],
  },
  {
    title: 'Configuración',
    items: [
      {
        id: 'abm-config-backup',
        label: 'ABM Configuraciones de Backup',
        icon: 'settings',
      },
    ],
  },
];

export default function BackupsPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header style={{ marginBottom: 20 }}>
        <h2>Backups</h2>
      </header>

      <div style={{ display: 'grid', gap: 24 }}>
        {GROUPS.map(g => (
          <section key={g.title}>
            <h3 style={{ marginBottom: 12 }}>{g.title}</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, 220px)',
                gap: 12,
                alignItems: 'stretch',
                justifyContent: 'start',
              }}
            >
              {g.items.map(it => (
                <button
                  key={it.id}
                  type='button'
                  onClick={() => navigate(`/app/admin/backups/${it.id}`)}
                  title={it.label}
                  className={styles.gridItemSm}
                  style={{
                    aspectRatio: '1 / 1',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 28 }}>{ICONS[it.icon] || '🔹'}</div>
                  <div style={{ textAlign: 'center' }} className={styles.label}>
                    {it.label}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
