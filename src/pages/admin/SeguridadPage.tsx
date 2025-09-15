import { useNavigate } from 'react-router-dom';
import styles from '../student/StudentHomePage.module.css';
import backStyles from '../../components/ui/BackButton.module.css';
import { ICONS } from './AdminIcons';

const GROUPS = [
  {
    title: 'Gestión de usuarios',
    items: [
      {
        id: 'gestionar-usuarios',
        label: 'Gestionar Usuarios',
        icon: 'users-cog',
      },
      {
        id: 'asignar-perfil',
        label: 'Asignar perfil de usuario',
        icon: 'user',
      },
      {
        id: 'asignar-permisos-dinamicos',
        label: 'Asignar permisos dinámicos a usuarios',
        icon: 'key',
      },
      {
        id: 'ver-historial-accesos',
        label: 'Ver historial de accesos',
        icon: 'clock',
      },
    ],
  },
  {
    title: 'Gestión de permisos',
    items: [
      { id: 'permisos', label: 'ABM Permisos', icon: 'settings' },
      {
        id: 'abm-grupos-usuarios',
        label: 'ABM Grupos de Usuarios',
        icon: 'users',
      },
      {
        id: 'abm-estados-usuario',
        label: 'ABM Estados de Usuario',
        icon: 'list',
      },
    ],
  },
  {
    title: 'Auditoría',
    items: [
      {
        id: 'historial-acciones',
        label: 'Ver historial de acciones del sistema',
        icon: 'file-text',
      },
    ],
  },
];

export default function SeguridadPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* small fixed back control (uses same styles as BackButton) */}
      <button
        className={backStyles.backBtn}
        type='button'
        aria-label='Volver'
        onClick={() => {
          try {
            if (window.history.length > 1) navigate(-1);
            else navigate('/app/admin');
          } catch {
            navigate('/app/admin');
          }
        }}
      >
        <span className={backStyles.arrow}>&larr;</span>
      </button>

      <header style={{ marginBottom: 20 }}>
        <h2>Seguridad</h2>
      </header>

      <div style={{ display: 'grid', gap: 24 }}>
        {GROUPS.map(g => (
          <section key={g.title}>
            <h3 style={{ marginBottom: 12 }}>{g.title}</h3>
            <div
              style={{
                display: 'grid',
                // fixed column width so tiles remain identical regardless of item count
                gridTemplateColumns: 'repeat(auto-fill, 220px)',
                gap: 12,
                alignItems: 'stretch',
                // align grid to the left so single items don't stretch to full width
                justifyContent: 'start',
              }}
            >
              {g.items.map(it => (
                <button
                  key={it.id}
                  type='button'
                  onClick={() =>
                    it.id === 'volver-admin'
                      ? navigate('/app/admin')
                      : navigate(`/app/admin/seguridad/${it.id}`)
                  }
                  title={it.label}
                  className={styles.gridItemSm}
                  style={{
                    // make each tile square and identical
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
