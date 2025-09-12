import { Button } from '../../components/ui/Button';
import styles from './ProfilePage.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useContext } from 'react';
import { Input } from '../../components/ui/Input';
import { BackButton } from '../../components/ui/BackButton';
import { getProfile, updateProfile } from '../../services/user';
import { deactivate } from '../../services/auth';
import { AuthContext } from '../../context/auth-context';
import { useEffect } from 'react';

interface UserProfile {
  nombre?: string;
  apellido?: string;
  fechaNacimiento?: string;
  dni?: number;
  email?: string;
}

export default function ProfilePage() {
  // Simulación de login (reemplaza por tu lógica real)

  const navigate = useNavigate();
  // Estado de edición y campos
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [fechaNacimiento, setFechaNacimiento] = useState<string>('');
  const [dni, setDni] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const auth = useContext(AuthContext);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
  };

  useEffect(() => {
    let mounted = true;
    setLoadingProfile(true);
    getProfile()
      .then(profile => {
        if (!mounted) return;
        const p = profile as UserProfile;
        setNombre(p.nombre || '');
        setApellido(p.apellido || '');
        setFechaNacimiento(p.fechaNacimiento || '');
        setDni(p.dni != null ? String(p.dni) : '');
        setEmail(p.email || '');
      })
      .catch(() => {
        if (!mounted) return;
        setError('No se pudo cargar el perfil');
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingProfile(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        nombre,
        apellido,
        fechaNacimiento,
        dni: dni ? Number(dni) : undefined,
      };
      await updateProfile(payload);
      setIsEditing(false);
    } catch (err: unknown) {
      let msg = 'Error al guardar los datos';
      if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>;
        const maybe = e['message'] || e['error'] || e['msg'];
        if (typeof maybe === 'string') msg = maybe;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <BackButton />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Datos del Usuario</h2>
          {!isEditing && (
            <a href='#' className={styles.editLink} onClick={handleEdit}>
              Editar datos
            </a>
          )}
        </div>
        <div className={styles.userData}>
          {loadingProfile ? (
            <div>Cargando perfil...</div>
          ) : isEditing ? (
            <form
              className={styles.form}
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
            >
              <Input
                label='Nombre'
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                fullWidth
              />
              <Input
                label='Apellido'
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                required
                fullWidth
              />
              <Input
                label='Fecha de nacimiento'
                type='date'
                value={fechaNacimiento}
                onChange={e => setFechaNacimiento(e.target.value)}
                required
                fullWidth
              />
              <Input
                label='DNI'
                type='number'
                value={dni}
                onChange={e => setDni(e.target.value)}
                required
                fullWidth
              />
              {error && <div className={styles.errorMessage}>{error}</div>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button type='submit' variant='primary' isLoading={isLoading}>
                  Guardar
                </Button>
                <Button type='button' variant='outline' onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <>
              <p>
                <b>Nombre:</b> {nombre}
              </p>
              <p>
                <b>Apellido:</b> {apellido}
              </p>
              <p>
                <b>Email:</b> {email}
              </p>
              <p>
                <b>Fecha de nacimiento:</b>{' '}
                {fechaNacimiento
                  ? (() => {
                      const parts = fechaNacimiento.split('-');
                      return parts.length === 3
                        ? `${parts[2]}/${parts[1]}/${parts[0]}`
                        : fechaNacimiento;
                    })()
                  : ''}
              </p>
              <p>
                <b>DNI:</b> {dni}
              </p>
            </>
          )}
        </div>
      </div>
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Carreras favoritas</h2>
        <div
          className={styles.linkCard}
          onClick={() => navigate('/app/student/favorites')}
        >
          <span className={styles.arrow}>&rarr;</span> Ir al listado de carreras
        </div>
      </div>
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Historial de Tests</h2>
        <div
          className={styles.linkCard}
          onClick={() => navigate('/app/student/tests')}
        >
          <span className={styles.icon}>&#128202;</span> Ver histórico de tests
        </div>
      </div>
      <div className={styles.cardDanger}>
        <h2 className={styles.sectionTitleDanger}>Baja de Usuario</h2>
        <p className={styles.dangerText}>
          Si desea abandonar la plataforma, puede hacerlo aquí. Esta acción
          marcará su perfil como dado de baja de forma lógica sin eliminar sus
          datos.
        </p>
        <Button
          type='button'
          variant='primary'
          size='md'
          fullWidth
          isLoading={isDeactivating}
          onClick={() => setShowDeactivateModal(true)}
        >
          Confirmar baja de usuario
        </Button>
      </div>

      {/* Modal de confirmación de baja */}
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
            <h3 style={{ marginTop: 0 }}>Confirmar baja de usuario</h3>
            <p>
              Vas a dar de baja tu usuario de forma lógica. Esto desactivará tu
              cuenta pero no eliminará tus datos. ¿Deseas continuar?
            </p>
            {error && (
              <div style={{ color: 'var(--danger, #b00020)', marginBottom: 8 }}>
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
                onClick={async () => {
                  setError(null);
                  setIsDeactivating(true);
                  try {
                    await deactivate();
                    if (auth && typeof auth.logout === 'function')
                      auth.logout();
                    setShowDeactivateModal(false);
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
                  }
                }}
              >
                Confirmar baja
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
