import { Button } from '../../components/ui/Button';
import styles from './ProfilePage.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useContext } from 'react';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { BackButton } from '../../components/ui/BackButton';
import { getProfile, updateProfile } from '../../services/user';
import { deactivate, changePassword } from '../../services/auth';
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

  // Estados para cambio de contraseña
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

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

        // Procesar la fecha para el input date (formato YYYY-MM-DD)
        let processedDate = p.fechaNacimiento || '';
        if (processedDate) {
          // Si ya está en formato YYYY-MM-DD, mantenerlo
          if (/^\d{4}-\d{2}-\d{2}$/.test(processedDate)) {
            // Ya está en el formato correcto para input date, no hacer nada
          } else {
            // Si viene en otro formato, intentar convertir
            try {
              const date = new Date(processedDate);
              if (!isNaN(date.getTime())) {
                // Convertir a formato YYYY-MM-DD para el input date
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                processedDate = `${year}-${month}-${day}`;
              }
            } catch {
              // Si hay error, mantener el valor original
            }
          }
        }

        setNombre(p.nombre || '');
        setApellido(p.apellido || '');
        setFechaNacimiento(processedDate);
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

  const handleChangePasswordClick = () => {
    setShowChangePasswordModal(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handleChangePasswordSubmit = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validaciones
    if (!oldPassword.trim()) {
      setPasswordError('Ingresa tu contraseña actual');
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError('Ingresa la nueva contraseña');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess('Contraseña cambiada exitosamente');
      // Limpiar campos después de 2 segundos y cerrar modal
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess(null);
      }, 2000);
    } catch (err: unknown) {
      let msg = 'Error al cambiar la contraseña';
      if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>;
        const maybe = e['message'] || e['error'] || e['msg'];
        if (typeof maybe === 'string') msg = maybe;
      }
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(null);
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
                      // Si está en formato YYYY-MM-DD, convertir directamente
                      if (/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
                        const parts = fechaNacimiento.split('-');
                        return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
                      }

                      // Si no, intentar parsear como Date
                      try {
                        const date = new Date(fechaNacimiento);
                        if (!isNaN(date.getTime())) {
                          const day = date
                            .getDate()
                            .toString()
                            .padStart(2, '0');
                          const month = (date.getMonth() + 1)
                            .toString()
                            .padStart(2, '0');
                          const year = date.getFullYear();
                          return `${day}/${month}/${year}`;
                        }
                      } catch {
                        // Si hay error, mostrar la fecha original
                      }

                      return fechaNacimiento;
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
      {
        <>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Carreras favoritas</h2>
            <div
              className={styles.linkCard}
              onClick={() => navigate('/app/student/favorites')}
            >
              <span className={styles.arrow}>&rarr;</span> Ir al listado de
              carreras
            </div>
          </div>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Historial de Tests</h2>
            <div
              className={styles.linkCard}
              onClick={() => navigate('/app/student/tests')}
            >
              <span className={styles.icon}>&#128202;</span> Ver histórico de
              tests
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Seguridad</h2>
            <div
              className={styles.linkCard}
              onClick={handleChangePasswordClick}
            >
              <span className={styles.icon}>🔒</span> Cambiar contraseña
            </div>
          </div>
        </>
      }
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

      {/* Modal de cambio de contraseña */}
      {showChangePasswordModal && (
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
            if (e.key === 'Escape') closeChangePasswordModal();
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              background: '#fff',
              borderRadius: 8,
              padding: '1.5rem',
              boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 0 }}>
                Cambiar contraseña
              </h3>
              <button
                type='button'
                onClick={closeChangePasswordModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <PasswordInput
                label='Contraseña actual'
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder='Ingresa tu contraseña actual'
                required
                fullWidth
              />

              <PasswordInput
                label='Nueva contraseña'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder='Ingresa la nueva contraseña'
                required
                fullWidth
              />

              <PasswordInput
                label='Confirmar nueva contraseña'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder='Confirma la nueva contraseña'
                required
                fullWidth
              />

              {passwordError && (
                <div
                  style={{
                    color: 'var(--danger, #b00020)',
                    fontSize: '0.875rem',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(176, 0, 32, 0.1)',
                    borderRadius: '4px',
                  }}
                >
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div
                  style={{
                    color: '#16a34a',
                    fontSize: '0.875rem',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '4px',
                  }}
                >
                  {passwordSuccess}
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: '1.5rem',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                type='button'
                variant='outline'
                onClick={closeChangePasswordModal}
                disabled={isChangingPassword}
              >
                Cancelar
              </Button>
              <Button
                type='button'
                variant='primary'
                isLoading={isChangingPassword}
                onClick={handleChangePasswordSubmit}
                disabled={
                  !oldPassword.trim() ||
                  !newPassword.trim() ||
                  !confirmPassword.trim()
                }
              >
                Cambiar contraseña
              </Button>
            </div>
          </div>
        </div>
      )}

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
