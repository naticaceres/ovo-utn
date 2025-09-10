import { useNavigate } from 'react-router-dom';
import styles from '../student/StudentHomePage.module.css';
import { ICONS } from './AdminIcons';
import { CATEGORIES, CATEGORY_ICON_KEY } from './adminConfig';

export default function AdminHomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          alignItems: 'stretch',
        }}
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type='button'
            onClick={() => navigate(`/app/admin/${cat.id}`)}
            aria-label={`Ir a ${cat.title}`}
            className={styles.gridItem}
            style={{
              height: 260,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              padding: 24,
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--card-bg, transparent)',
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 72 }}>
              {ICONS[CATEGORY_ICON_KEY[cat.id] || 'layers']}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{cat.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
