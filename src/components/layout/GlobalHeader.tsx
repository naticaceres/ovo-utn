import React from 'react';
import { Link } from 'react-router-dom';
import OvoLogo from '../../assets/ovoLogo.svg?react';
import styles from './GlobalHeader.module.css';

interface GlobalHeaderProps {
  children?: React.ReactNode; // Para contenido personalizado en la navegación
}

export function GlobalHeader({ children }: GlobalHeaderProps) {
  return (
    <header className={styles.globalHeader}>
      <div className={styles.headerContent}>
        <div className={styles.logoSection}>
          <Link to='/' className={styles.logoLink}>
            <OvoLogo viewBox='0 0 1600 1200' />
            <span className={styles.brandText}>
              ORIENTACIÓN VOCACIONAL ONLINE
            </span>
          </Link>
        </div>

        <nav className={styles.navigation}>
          {children || (
            <>
              <Link to='/app/login' className={styles.navLink}>
                Iniciar sesión
              </Link>
              <Link to='/app/signup' className={styles.navButton}>
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
