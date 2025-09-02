import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from 'src/context/api';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from './SignupPage.module.css';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authApi.signup({ name, email, password });
      navigate('/app/login');
    } catch {
      setError('No se pudo registrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.signupContainer}>
        <div className={styles.signupCard}>
          <h1 className={styles.title}>Crear cuenta</h1>
          <p className={styles.subtitle}>
            Únete a OVO y descubre tu vocación profesional
          </p>

          <form onSubmit={onSubmit} className={styles.form}>
            <Input
              label='Nombre completo'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Ingresa tu nombre completo'
              required
              fullWidth
            />

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
              placeholder='Mínimo 8 caracteres'
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
              Crear cuenta
            </Button>
          </form>

          <div className={styles.loginLink}>
            ¿Ya tienes cuenta?{' '}
            <a href='/app/login' className={styles.link}>
              Inicia sesión
            </a>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
