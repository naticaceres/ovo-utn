import { useParams, useNavigate } from 'react-router-dom';
import { BackButton } from '../../components/ui/BackButton';
import styles from '../student/StudentHomePage.module.css';
import { ICONS } from './AdminIcons';
import { CATEGORIES, getVisibleItemsInCategory } from './adminConfig';
import { usePermissions } from '../../context/use-permissions';
import React from 'react';

export default function AdminCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { userPermissions } = usePermissions();

  const category = CATEGORIES.find(c => c.id === categoryId);

  if (!category) {
    return (
      <div className={styles.container}>
        <BackButton />
        <h2>Categoría no encontrada</h2>
        <p>La categoría "{categoryId}" no existe.</p>
      </div>
    );
  }

  // Verificar si el usuario tiene permisos para esta categoría
  if (category.requiredPermissions && category.requiredPermissions.length > 0) {
    const hasAccess = category.requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAccess) {
      return (
        <div className={styles.container}>
          <BackButton />
          <h2>Acceso Denegado</h2>
          <p>
            No tienes permisos para acceder a la sección "{category.title}".
          </p>
        </div>
      );
    }
  }

  // Obtener solo los items visibles según los permisos del usuario
  const categoryWithFilteredItems = getVisibleItemsInCategory(
    category,
    userPermissions
  );

  // Si no hay items visibles después del filtrado
  if (categoryWithFilteredItems.groups.length === 0) {
    return (
      <div className={styles.container}>
        <BackButton />
        <h2>{category.title}</h2>
        <div
          style={{
            textAlign: 'center',
            padding: 40,
            color: '#666',
            fontSize: 16,
          }}
        >
          No tienes permisos para acceder a ninguna funcionalidad de esta
          sección.
        </div>
      </div>
    );
  }

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
        {categoryWithFilteredItems.groups.map(g => (
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
