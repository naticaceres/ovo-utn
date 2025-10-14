import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/use-auth';
import OvoLogo from '../../assets/ovoLogo.svg?react';
import styles from './GlobalHeader.module.css';

interface GlobalHeaderProps {
  children?: React.ReactNode; // Para contenido personalizado en la navegación
}

export function GlobalHeader({ children }: GlobalHeaderProps) {
  // Intentar obtener el usuario, pero manejar el caso donde el contexto no esté disponible
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch {
    // Si no hay AuthProvider disponible, user será null
  }

  // Función para determinar la ruta del home según el usuario
  const getHomeRoute = () => {
    if (!user) return '/'; // Usuario no logueado va a la página principal

    // Verificar grupos del usuario
    if (user.grupos && user.grupos.length > 0) {
      const groups = user.grupos.map((g: string) => g.toLowerCase());

      if (
        groups.some(
          (g: string) => g.includes('administrador') || g.includes('admin')
        )
      ) {
        return '/app/admin';
      }
      if (
        groups.some(
          (g: string) => g.includes('institucion') || g.includes('institución')
        )
      ) {
        return '/app/institucion';
      }
      if (groups.some((g: string) => g.includes('estudiante'))) {
        return '/app/student';
      }
    }

    // Si no se encuentra ningún grupo conocido, ir al home por defecto
    return '/';
  };

  return (
    <header className={styles.globalHeader}>
      <div className={styles.headerContent}>
        <div className={styles.logoSection}>
          <Link to={getHomeRoute()} className={styles.logoLink}>
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
