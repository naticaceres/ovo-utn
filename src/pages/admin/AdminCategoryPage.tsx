import { useParams, useNavigate } from 'react-router-dom';
import { BackButton } from '../../components/ui/BackButton';
import styles from '../student/StudentHomePage.module.css';
import { ICONS } from './AdminIcons';
import { CATEGORIES } from './adminConfig';
import React from 'react';

export default function AdminCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const category = CATEGORIES.find(c => c.id === categoryId);
  if (!category)
    return (
      <div className={styles.container}>
        <h2>Categoría no encontrada</h2>
      </div>
    );

  const getIcon = (key?: string): React.ReactNode => {
    if (!key) return '🔹';
    const lookup = (ICONS as Record<string, React.ReactNode>)[key];
    return lookup ?? '🔹';
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <header style={{ marginBottom: 20 }}>
        <h2>{category.title}</h2>
      </header>

      <div style={{ display: 'grid', gap: 24 }}>
        {category.groups.map(g => (
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
                  onClick={() => navigate(`/app/admin/${category.id}/${it.id}`)}
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
                  <div style={{ fontSize: 28 }}>{getIcon(it.icon)}</div>
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
