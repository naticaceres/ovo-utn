import { useNavigate } from 'react-router-dom';
import styles from './StudentHomePage.module.css';
import { usePermissions } from '../../context/use-permissions';
import { getVisibleStudentItems } from './studentConfig';

export default function StudentHomePage() {
  const navigate = useNavigate();
  const { userPermissions } = usePermissions();

  // Obtener solo los items visibles según los permisos del usuario
  const visibleItems = getVisibleStudentItems(userPermissions);

  // Debug: Agregar logs para diagnosticar
  console.log('StudentHomePage - User permissions:', userPermissions);
  console.log('StudentHomePage - Visible items:', visibleItems);

  // Nota: Ya no verificamos si visibleItems.length === 0 porque siempre habrá items básicos

  return (
    <div className={styles.container}>
      {/* Acciones principales */}
      <div className={styles.grid}>
        {visibleItems.map(item => (
          <div
            key={item.id}
            className={styles.gridItem}
            onClick={() => navigate(item.route)}
            title={item.label}
          >
            <span className={styles.icon}>{item.icon || '📋'}</span>
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Mostrar información de permisos en desarrollo */}
      <div
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: '#f0f0f0',
          borderRadius: 5,
          fontSize: 12,
          color: '#666',
        }}
      >
        <strong>Items visibles:</strong> {visibleItems.length}
        <br />
        <strong>Permisos:</strong> {userPermissions.join(', ')}
      </div>
    </div>
  );
}
