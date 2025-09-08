import { Button } from '../../components/ui/Button';
import styles from './ProfilePage.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { BackButton } from '../../components/ui/BackButton';

export default function ProfilePage() {
  // Simulación de login (reemplaza por tu lógica real)

  const navigate = useNavigate();
  // Estado de edición y campos
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState('Test');
  const [apellido, setApellido] = useState('Estudiante');
  const [fechaNacimiento, setFechaNacimiento] = useState('2007-06-09');
  const [dni, setDni] = useState('12345678');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Reemplaza la URL por la de tu backend
      const res = await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, fechaNacimiento, dni }),
      });
      if (!res.ok) throw new Error('Error al guardar los datos');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los datos');
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
          {isEditing ? (
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
                <b>Email:</b> test@ovo.com
              </p>
              <p>
                <b>Fecha de nacimiento:</b>{' '}
                {fechaNacimiento.split('-').reverse().join('/')}
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
          onClick={() => navigate('/app/student/carreras')}
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
        <Button type='button' variant='primary' size='md' fullWidth>
          Confirmar baja de usuario
        </Button>
      </div>
    </div>
  );
}
