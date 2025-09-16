import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../../services/login';
import { setAuthToken, getApiErrorMessage } from '../../context/api';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('m1718c@gmail.com');
  const [password, setPassword] = useState('Holatrolo1');
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
      const usuario = resp.usuario || resp.user || resp;

      // El servicio ahora devuelve la respuesta completa. Revisar headers para new_token
      type Loose = Record<string, unknown>;
      const headerToken = (
        resp as unknown as { headers?: Record<string, string> }
      ).headers?.['new_token'];
      const data = (resp as unknown as { data?: Loose }).data;
      const bodyToken =
        (data?.token as string | undefined) ||
        (data?.accessToken as string | undefined) ||
        (data?.access_token as string | undefined);
      const token = headerToken || bodyToken;
      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
      }

      // Guardamos la respuesta (body) completa para usarla después
      localStorage.setItem(
        'user',
        JSON.stringify((resp as unknown as { data?: Loose }).data || resp)
      );

      const hasGroup = (name: string) => {
        const r: unknown = resp;
        type Loose = Record<string, unknown>;
        const getArr = (obj: unknown) =>
          (((obj as Loose)?.data as Loose | undefined)?.grupos as
            | string[]
            | undefined) ||
          (((obj as Loose)?.data as Loose | undefined)?.groups as
            | string[]
            | undefined) ||
          ((obj as Loose)?.grupos as string[] | undefined) ||
          ((obj as Loose)?.groups as string[] | undefined) ||
          [];
        const candidates = getArr(r) as string[];
        return candidates.some(
          (g: unknown) =>
            typeof g === 'string' &&
            g.toLowerCase().includes(name.toLowerCase())
        );
      };

      // Prioridad: administrador > institucion > estudiante
      if (hasGroup('administrador') || hasGroup('admin')) {
        navigate('/app/admin');
      } else if (hasGroup('institucion') || hasGroup('institución')) {
        navigate('/app/institucion');
      } else if (hasGroup('Estudiante')) {
        navigate('/app/student');
      } else if (
        usuario &&
        (((usuario as Loose).name as string | undefined) ===
          'estudiante user' ||
          ((usuario as Loose).role as string | undefined) === 'estudiante')
      ) {
        // fallback por compatibilidad con la lógica previa
        navigate('/app/student');
      } else {
        navigate('/app/questionnaire');
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
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
