import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../../services/login';
import { setAuthToken } from '../../context/api';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('estudiante@prueba.com');
  const [password, setPassword] = useState('Prueba1234.');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const resp = await loginService(email, password);
      if (!resp) {
        setError('Credenciales inválidas');
        return;
      }

      // La respuesta esperada puede tener la forma:
      // { grupos: [...], permisos: [...], usuario: { ... } }
      const grupos: string[] = resp.grupos || resp.groups || [];
      const usuario = resp.usuario || resp.user || resp;

      // El servicio ahora devuelve la respuesta completa. Revisar headers para new_token
      const headerToken = resp?.headers?.['new_token'];
      const bodyToken =
        resp?.data?.token ||
        resp?.data?.accessToken ||
        resp?.data?.access_token;
      const token = headerToken || bodyToken;
      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
      }

      // Guardamos la respuesta (body) completa para usarla después
      localStorage.setItem('user', JSON.stringify(resp.data || resp));

      const hasGroup = (name: string) =>
        resp.data.grupos.some(
          g =>
            typeof g === 'string' &&
            g.toLowerCase().includes(name.toLowerCase())
        );

      // Prioridad: administrador > institucion > estudiante
      if (hasGroup('administrador') || hasGroup('admin')) {
        navigate('/app/admin');
      } else if (hasGroup('institucion') || hasGroup('institución')) {
        navigate('/app/institucion');
      } else if (hasGroup('Estudiante')) {
        navigate('/app/student');
      } else if (
        usuario &&
        (usuario.name === 'estudiante user' || usuario.role === 'estudiante')
      ) {
        // fallback por compatibilidad con la lógica previa
        navigate('/app/student');
      } else {
        navigate('/app/questionnaire');
      }
    } catch (err) {
      setError(
        'Error al iniciar sesión' +
          (err instanceof Error ? `: ${err.message}` : '')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1 className={styles.title}>Iniciar sesión</h1>
          <p className={styles.subtitle}>Accede a tu cuenta de OVO</p>

          <form onSubmit={onSubmit} className={styles.form}>
            <Input
              label='Email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='tu@email.com'
              required
              fullWidth
            />

            <Input
              label='Contraseña'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='Tu contraseña'
              required
              fullWidth
            />

            {error && (
              <div className={styles.errorMessage} role='alert'>
                {error}
              </div>
            )}

            <Button
              type='submit'
              variant='primary'
              size='lg'
              fullWidth
              isLoading={isLoading}
            >
              Entrar
            </Button>
          </form>

          <div className={styles.signupLink}>
            ¿No tienes cuenta?{' '}
            <a href='/app/signup' className={styles.link}>
              Regístrate aquí
            </a>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
