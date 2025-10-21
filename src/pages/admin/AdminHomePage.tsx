import { useNavigate } from 'react-router-dom';
import styles from '../student/StudentHomePage.module.css';
import { ICONS } from './AdminIcons';
import { CATEGORY_ICON_KEY, getVisibleCategories } from './adminConfig';
import { usePermissions } from '../../context/use-permissions';

export default function AdminHomePage() {
  const navigate = useNavigate();
  const { userPermissions } = usePermissions();

  // Debug: Agregar logs para diagnosticar el problema
  console.log('AdminHomePage - User permissions:', userPermissions);
  console.log('AdminHomePage - Permissions length:', userPermissions.length);

  // Obtener solo las categorías visibles según los permisos del usuario
  const visibleCategories = getVisibleCategories(userPermissions);

  console.log('AdminHomePage - Visible categories:', visibleCategories);
  console.log(
    'AdminHomePage - Visible categories count:',
    visibleCategories.length
  );

  // Si no hay categorías visibles, mostrar mensaje
  if (visibleCategories.length === 0) {
    return (
      <div className={styles?.container ?? ''} style={{ padding: 20 }}>
        <h1 style={{ marginBottom: 16 }}>Panel de Administración</h1>
        <div
          style={{
            textAlign: 'center',
            padding: 40,
            color: '#666',
            fontSize: 18,
          }}
        >
          No tienes permisos para acceder a ninguna sección del panel de
          administración.
          <br />
          <small style={{ display: 'block', marginTop: 10, fontSize: 14 }}>
            Permisos actuales:{' '}
            {userPermissions.length === 0
              ? 'Ninguno'
              : userPermissions.join(', ')}
          </small>
        </div>
      </div>
    );
  }

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
        {visibleCategories.map(cat => (
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
