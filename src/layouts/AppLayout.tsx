import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthProvider } from '../context/AuthProvider';
import { MainLayout } from '../components/layout/MainLayout';
import styles from './AppLayout.module.css';
import { useAuth } from '../context/use-auth';

export function AppLayout() {
  const { user, logout } = useAuth();

  // Debug temporal: mostrar datos del localStorage
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      console.log('Raw localStorage user:', storedUser);
      try {
        const parsed = JSON.parse(storedUser);
        console.log('Parsed localStorage user:', parsed);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Función para obtener el nombre del grupo principal del usuario
  const getUserGroupDisplay = () => {
    if (!user?.grupos || user.grupos.length === 0) return null;

    // Buscar el grupo más relevante (administrador tiene prioridad)
    const groups = user.grupos.map(g => g.toLowerCase());

    if (groups.some(g => g.includes('administrador') || g.includes('admin'))) {
      return 'Administrador';
    }
    if (
      groups.some(g => g.includes('institucion') || g.includes('institución'))
    ) {
      return 'Institución';
    }
    if (groups.some(g => g.includes('estudiante'))) {
      return 'Estudiante';
    }

    // Si no encuentra ninguno conocido, devuelve el primer grupo capitalizado
    return user.grupos[0].charAt(0).toUpperCase() + user.grupos[0].slice(1);
  };

  // Función para verificar si el usuario es estudiante
  const isStudent = () => {
    if (!user) return false;

    // Verificar por grupos primero (más confiable)
    if (user.grupos && user.grupos.length > 0) {
      const groups = user.grupos.map((g: string) => g.toLowerCase());
      return groups.some((g: string) => g.includes('estudiante'));
    }

    return false;
  };

  // Función para obtener el nombre del usuario
  const getUserName = () => {
    if (!user) return '';

    // Debug: vamos a ver qué datos tiene el usuario
    console.log('User object:', user);

    const name = user.usuario.nombre || user.usuario.mail || 'Usuario';
    console.log('Resolved name:', name);
    return name;
  };

  return (
    <MainLayout
      headerContent={
        <nav className={styles.nav}>
          {isStudent() && (
            <>
              <Link to='/app/questionnaire' className={styles.navLink}>
                Cuestionario
              </Link>
              <Link to='/app/results' className={styles.navLink}>
                Resultados
              </Link>
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
            <>
              {getUserGroupDisplay() && (
                <span className={styles.userInfo}>{getUserGroupDisplay()}</span>
              )}
              <span className={styles.userName}>👤 {getUserName()}</span>
              <Link to='/' className={styles.navLink} onClick={logout}>
                Cerrar sesión
              </Link>
            </>
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
