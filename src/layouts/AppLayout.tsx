import { Outlet, Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <MainLayout
      headerContent={
        <nav className={styles.nav}>
          <Link to='/app/questionnaire' className={styles.navLink}>
            Cuestionario
          </Link>
          <Link to='/app/results' className={styles.navLink}>
            Resultados
          </Link>
          <Link to='/app/login' className={styles.navLink}>
            Ingresar
          </Link>
          <Link to='/app/signup' className={styles.navLink}>
            Registro
          </Link>
        </nav>
      }
    >
      <div className={styles.appContent}>
        <Outlet />
      </div>
    </MainLayout>
  );
}
