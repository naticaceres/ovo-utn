import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerService } from '../../services/auth.js';
import { TermsContent } from '../legal/TerminosYCondicionesPage';
import { PrivacyContent } from '../legal/PoliticasDePrivacidadPage';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from './SignupPage.module.css';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // modalStage: 0 = closed, 1 = show Terms, 2 = show Privacy
  const [modalStage, setModalStage] = useState<number>(0);
  const legalScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (modalStage === 2 && legalScrollRef.current) {
      // ensure privacy scroll starts at top when we open the privacy stage
      legalScrollRef.current.scrollTop = 0;
    }
  }, [modalStage]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    // Iniciar flujo: primero Términos y Condiciones
    setModalStage(1);
  };

  function extractErrorMessage(err: unknown) {
    if (!err) return 'No se pudo registrar';
    if (typeof err === 'string') return err;
    if (typeof err === 'object' && err !== null) {
      const e = err as Record<string, unknown>;
      let maybeMsg: unknown = e['message'] || e['error'] || e['msg'];
      if (!maybeMsg && e['data'] && typeof e['data'] === 'object') {
        const dataObj = e['data'] as Record<string, unknown>;
        maybeMsg = dataObj['message'];
      }
      if (typeof maybeMsg === 'string') return maybeMsg;
      return JSON.stringify(e);
    }
    return String(err);
  }

  const performRegister = async (accepted = false) => {
    setIsLoading(true);
    try {
      const payload = {
        nombre: name,
        correo: email,
        contrasena: password,
        aceptaPoliticas: accepted,
      };
      await registerService(payload);
      setModalStage(0);
      navigate('/app/login');
    } catch (err: unknown) {
      // cerrar modal si hay un error al intentar registrar
      setModalStage(0);
      setError(extractErrorMessage(err));
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

            <div className={styles.termsNote}>
              Al registrarte se te pedirá aceptar los Términos y las Políticas
              de Privacidad.
            </div>

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

          {/* Two-step modal: stage 1 = Terms, stage 2 = Privacy */}
          {modalStage > 0 && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal} role='dialog' aria-modal='true'>
                <h2>
                  {modalStage === 1
                    ? 'Términos y Condiciones'
                    : 'Políticas de Privacidad'}
                </h2>
                <div className={styles.modalContent}>
                  <div className={styles.modalHalf}>
                    {modalStage === 1 ? (
                      <div className={styles.legalScroll}>
                        <TermsContent />
                      </div>
                    ) : (
                      <div className={styles.legalScroll} ref={legalScrollRef}>
                        <PrivacyContent />
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button
                    className={styles.btnSecondary}
                    onClick={() => {
                      setModalStage(0);
                    }}
                  >
                    Cancelar
                  </button>
                  {modalStage === 1 ? (
                    <button
                      className={styles.btnPrimary}
                      onClick={() => {
                        // avanzar a políticas
                        setModalStage(2);
                      }}
                    >
                      Aceptar y ver Políticas
                    </button>
                  ) : (
                    <button
                      className={styles.btnPrimary}
                      onClick={() => {
                        performRegister(true);
                      }}
                      disabled={isLoading}
                    >
                      Aceptar y registrar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

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
