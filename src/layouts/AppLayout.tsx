import { Outlet, Link } from 'react-router-dom';
import { AuthProvider } from '../lib/AuthProvider';
import { MainLayout } from '../components/layout/MainLayout';
import styles from './AppLayout.module.css';
import { useAuth } from '../lib/use-auth';

export function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <MainLayout
      headerContent={
        <nav className={styles.nav}>
          {user && user.role === 'estudiante' && (
            <>
              {' '}
              <Link to='/app/questionnaire' className={styles.navLink}>
                Cuestionario
              </Link>
              <Link to='/app/results' className={styles.navLink}>
                Resultados
              </Link>{' '}
            </>
          )}
          {!user && (
            <>
              <Link to='/app/login' className={styles.navLink}>
                Ingresar
              </Link>
              <Link to='/app/signup' className={styles.navLink}>
                Registro
              </Link>
            </>
          )}
          {user && (
            <Link to='/' className={styles.navLink} onClick={logout}>
              Cerrar sesión
            </Link>
          )}
        </nav>
      }
    >
      <div className={styles.appContent}>
        <Outlet />
      </div>
    </MainLayout>
  );
}

export function AppLayoutWrapper() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
