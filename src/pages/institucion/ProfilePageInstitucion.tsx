import { useContext, useState } from 'react';
import styles from './ProfilePageInstitucion.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { AuthContext } from '../../context/auth-context';
import type { AuthUser } from '../../context/auth-context';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { updateProfile } from '../../services/user';
import { deactivate } from '../../services/auth';

export default function ProfilePageInstitucion() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const institutionName = auth?.user?.name ?? 'Usuario';
  const emailFromAuth = auth?.user?.email ?? '';

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>(institutionName);
  const [email, setEmail] = useState<string>(emailFromAuth);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      // update user profile (name/email)
      await updateProfile({ nombre: name, email });
      // reflect change in AuthContext if available
      if (auth && typeof auth.login === 'function') {
        const existing = auth.user as AuthUser | null;
        if (existing) {
          const next: AuthUser = { ...existing, name, email };
          auth.login(next);
        }
      }
      setIsEditing(false);
    } catch (err: unknown) {
      let msg = 'No se pudo guardar';
      if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>;
        const maybe = e['message'] || e['error'] || e['msg'];
        if (typeof maybe === 'string') msg = maybe;
      }
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setError(null);
    setIsDeactivating(true);
    try {
      await deactivate();
      if (auth && typeof auth.logout === 'function') auth.logout();
      navigate('/app/login');
    } catch (err: unknown) {
      let msg = 'No se pudo procesar la baja';
      if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>;
        const maybe = e['message'] || e['error'] || e['msg'];
        if (typeof maybe === 'string') msg = maybe;
      }
      setError(msg);
    } finally {
      setIsDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <BackButton />
        <div className={styles.card}>
          <h1 className={styles.title}>{institutionName}</h1>
          <p>
            <strong>Tipo de cuenta:</strong> Institución
          </p>

          <div className={styles.field}>
            {!isEditing ? (
              <>
                <p>
                  <strong>Nombre:</strong> {name}
                </p>
                <p>
                  <strong>Email:</strong> {email}
                </p>
                <div style={{ marginTop: 12 }}>
                  <a
                    href='#'
                    onClick={e => {
                      e.preventDefault();
                      setIsEditing(true);
                    }}
                  >
                    Editar datos
                  </a>
                </div>
              </>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <Input
                  label='Nombre'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  fullWidth
                  required
                />
                <Input
                  label='Email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  fullWidth
                  required
                />
                {error && <div className={styles.error}>{error}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button type='submit' isLoading={isSaving}>
                    Guardar
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

     
          </div>
        </div>

        <div style={{ marginTop: 18 }} className={styles.cardDanger}>
          <h2 className={styles.sectionTitleDanger}>Baja de Usuario</h2>
          <p className={styles.dangerText}>
            Si desea abandonar la plataforma, puede hacerlo aquí. Esta acción
            marcará su perfil como dado de baja de forma lógica sin eliminar sus
            datos.
          </p>
          <Button
            type='button'
            variant='primary'
            fullWidth
            isLoading={isDeactivating}
            onClick={() => setShowDeactivateModal(true)}
          >
            Confirmar baja de usuario
          </Button>
        </div>

        {/* Deactivate modal */}
        {showDeactivateModal && (
          <div
            role='dialog'
            aria-modal='true'
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.45)',
              zIndex: 9999,
              padding: '1rem',
            }}
            onKeyDown={e => {
              if (e.key === 'Escape') setShowDeactivateModal(false);
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 520,
                background: '#fff',
                borderRadius: 8,
                padding: '1.25rem',
                boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
              }}
            >
              <h3 style={{ marginTop: 0 }}>Confirmar baja de institución</h3>
              <p>
                Vas a dar de baja la institución. Esto desactivará la cuenta
                pero no eliminará los datos. ¿Deseas continuar?
              </p>
              {error && (
                <div
                  style={{ color: 'var(--danger, #b00020)', marginBottom: 8 }}
                >
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowDeactivateModal(false)}
                  disabled={isDeactivating}
                >
                  Cancelar
                </Button>
                <Button
                  type='button'
                  variant='primary'
                  isLoading={isDeactivating}
                  onClick={handleDeactivate}
                >
                  Confirmar baja
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
