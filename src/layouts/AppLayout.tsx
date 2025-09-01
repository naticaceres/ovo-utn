import { Outlet, Link } from 'react-router-dom';
import styles from '@/styles/layout.module.css';

export function AppLayout() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to='/' className={styles.brand}>
            ovo
          </Link>
          <div className={styles.spacer} />
          <Link to='/questionnaire'>Cuestionario</Link>
          <Link to='/results'>Resultados</Link>
          <Link to='/login'>Ingresar</Link>
          <Link to='/signup'>Registro</Link>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        © {new Date().getFullYear()} ovo
      </footer>
    </div>
  );
}
