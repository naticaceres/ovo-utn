import { useNavigate } from 'react-router-dom';
import styles from '../student/StudentHomePage.module.css';
import { ICONS } from './AdminIcons';

const GROUPS = [
  {
    title: 'Gestión de Carreras',
    items: [
      { id: 'abm-carreras-base', label: 'ABM Carreras Base', icon: 'book' },
      { id: 'abm-tipos-carrera', label: 'ABM Tipos de Carrera', icon: 'list' },
      {
        id: 'abm-modalidades-carrera',
        label: 'ABM Modalidades de Carrera',
        icon: 'grid',
      },
      {
        id: 'abm-estados-carrera-inst',
        label: 'ABM Estados de Carrera Institución',
        icon: 'clock',
      },
    ],
  },
];

export default function CarrerasPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header style={{ marginBottom: 20 }}>
        <h2>Carreras</h2>
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
                  onClick={() => navigate(`/app/admin/carreras/${it.id}`)}
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
