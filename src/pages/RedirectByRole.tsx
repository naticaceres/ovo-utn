import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/use-auth';

/**
 * Componente que redirige automáticamente según el rol del usuario
 * Usado en la ruta /app para determinar a dónde enviar al usuario
 */
export function RedirectByRole() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Si no hay usuario autenticado, redirigir al login
      navigate('/app/login', { replace: true });
      return;
    }

    // Verificar si hay un test pendiente
    const pendingTestId = localStorage.getItem('pendingTestId');
    if (pendingTestId) {
      navigate('/app/results', { replace: true });
      return;
    }

    // Obtener los grupos del usuario
    const grupos = user.grupos || [];

    // Convertir a minúsculas para comparación insensible a mayúsculas
    const gruposLower = grupos.map((g: string) => g.toLowerCase());

    // Determinar la ruta según el grupo
    // Prioridad: administrador > institucion > estudiante
    if (
      gruposLower.some(
        (g: string) => g.includes('administrador') || g.includes('admin')
      )
    ) {
      navigate('/app/admin', { replace: true });
    } else if (
      gruposLower.some(
        (g: string) => g.includes('institucion') || g.includes('institución')
      )
    ) {
      navigate('/app/institucion', { replace: true });
    } else if (gruposLower.some((g: string) => g.includes('estudiante'))) {
      navigate('/app/student', { replace: true });
    } else {
      // Si no tiene un grupo específico, enviar al cuestionario
      navigate('/app/questionnaire', { replace: true });
    }
  }, [user, navigate]);

  // Mostrar un loading mientras se determina la redirección
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666',
      }}
    >
      Cargando...
    </div>
  );
}
