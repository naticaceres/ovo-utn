import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, forgotPassword } from '../../services/login';
import { loginGoogle } from '../../services/auth';
import { setAuthToken, getApiErrorMessage } from '../../context/api';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('m1718c@gmail.com');
  const [password, setPassword] = useState('Holatrolo1');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
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
      const fullUserData = (resp as unknown as { data?: Loose }).data || resp;
      console.log('Login response - fullUserData:', fullUserData);
      localStorage.setItem('user', JSON.stringify(fullUserData));

      // Redirigir a /app, que determinará automáticamente la ruta según el rol
      navigate('/app');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotModal(true);
    setForgotEmail('');
    setForgotError(null);
    setForgotMessage(null);
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Por favor ingresa tu email');
      return;
    }

    setForgotError(null);
    setForgotMessage(null);
    setIsForgotLoading(true);

    try {
      await forgotPassword(forgotEmail);
      setForgotMessage(
        'Se ha enviado un email con las instrucciones para recuperar tu contraseña.'
      );
    } catch (err) {
      setForgotError(getApiErrorMessage(err));
    } finally {
      setIsForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotError(null);
    setForgotMessage(null);
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (!credentialResponse.credential) {
      setError('No se recibió credencial de Google');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const resp = await loginGoogle(credentialResponse.credential);
      if (!resp) {
        setError('Error al iniciar sesión con Google');
        return;
      }

      // Procesar la respuesta similar a login normal
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

      const fullUserData = (resp as unknown as { data?: Loose }).data || resp;
      console.log('Google login response - fullUserData:', fullUserData);
      localStorage.setItem('user', JSON.stringify(fullUserData));

      // Redirigir a /app, que determinará automáticamente la ruta según el rol
      navigate('/app');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Error al iniciar sesión con Google');
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

            <PasswordInput
              label='Contraseña'
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

          <div className={styles.divider}>
            <span>o</span>
          </div>

          <div className={styles.googleButton}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text='signin_with'
              locale='es'
            />
          </div>

          <div className={styles.forgotPassword}>
            <Button
              type='button'
              variant='outline'
              onClick={handleForgotPasswordClick}
              disabled={isLoading}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>

          <div className={styles.signupLink}>
            ¿No tienes cuenta?{' '}
            <a href='/app/signup' className={styles.link}>
              Regístrate aquí
            </a>
          </div>
        </div>

        {/* Modal de Recuperar Contraseña */}
        {showForgotModal && (
          <div className={styles.modalBackdrop} onClick={closeForgotModal}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Recuperar contraseña</h2>
                <button
                  className={styles.closeButton}
                  onClick={closeForgotModal}
                  type='button'
                >
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                <p className={styles.modalDescription}>
                  Ingresa tu email y te enviaremos las instrucciones para
                  recuperar tu contraseña.
                </p>

                <Input
                  label='Email'
                  type='email'
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder='tu@email.com'
                  required
                  fullWidth
                />

                {forgotError && (
                  <div className={styles.errorMessage} role='alert'>
                    {forgotError}
                  </div>
                )}

                {forgotMessage && (
                  <div className={styles.successMessage} role='alert'>
                    {forgotMessage}
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <Button
                  type='button'
                  variant='outline'
                  onClick={closeForgotModal}
                  disabled={isForgotLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type='button'
                  variant='primary'
                  onClick={handleForgotPasswordSubmit}
                  isLoading={isForgotLoading}
                  disabled={!forgotEmail.trim()}
                >
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
