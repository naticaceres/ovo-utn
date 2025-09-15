import { useNavigate } from 'react-router-dom';
import styles from '../student/StudentHomePage.module.css';
import { ICONS } from './AdminIcons';
import { CATEGORIES, CATEGORY_ICON_KEY } from './adminConfig';

export default function AdminHomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles?.container ?? ''} style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 16 }}>Panel de Administración</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          alignItems: 'stretch',
        }}
      >
        {CATEGORIES.map(cat => (
          //acaaaaa
          <button
            key={cat.id}
            type='button'
            onClick={() => navigate(`/app/admin/${cat.id}`)}
            aria-label={`Ir a ${cat.title}`}
            className={styles?.gridItem ?? ''}
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
              background: 'var(--card-bg, #f7f7f7)',
              borderRadius: 10,
              border: '1px solid var(--card-border, #e5e5e5)',
            }}
          >
            <div style={{ fontSize: 72 }}>
              {ICONS?.[CATEGORY_ICON_KEY[cat.id] || 'layers'] ?? '🗂️'}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{cat.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
