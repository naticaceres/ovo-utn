import { useNavigate } from 'react-router-dom';
import styles from '../student/StudentHomePage.module.css';
import { ICONS } from './AdminIcons';

const GROUPS = [
  {
    title: 'Aprobar/rechazar Solicitudes',
    items: [
      {
        id: 'solicitudes-instituciones',
        label: 'Solicitudes de Instituciones',
        icon: 'file-text',
      },
    ],
  },
  {
    title: 'Gestión de instituciones',
    items: [
      {
        id: 'abm-tipos-institucion',
        label: 'ABM Tipos de Institución',
        icon: 'layers',
      },
      {
        id: 'abm-estados-institucion',
        label: 'ABM Estados de Institución',
        icon: 'list',
      },
    ],
  },
];

export default function InstitucionesPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header style={{ marginBottom: 20 }}>
        <h2>Instituciones</h2>
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
                  onClick={() => navigate(`/app/admin/instituciones/${it.id}`)}
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
