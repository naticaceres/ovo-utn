import styles from './DetalleInstitucionPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '../../context/api';
import { useAuth } from '../../context/use-auth';

type Institucion = {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  ubicacion?: string;
  carrerasDisponibles?: number;
  carreras?: string[];
};

export default function DetalleInstitucionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [institucion, setInstitucion] = useState<Institucion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstitucion() {
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Asumimos que el usuario de tipo 'institucion' tiene el id de la institución
        //cuando creemos un usuario institucion aca poner el id user.id
        const id = 1;

        const { data } = await api.get(`/api/v1/institutions/${id}`);
        // El endpoint en tu Postman devuelve { institution: {...}, carreras: [] }
        const inst = data.institution || data;
        const carreras = data.carreras || [];
        setInstitucion({
          id: inst.id,
          nombre: inst.nombre,
          descripcion: inst.descripcion || inst.mail || '',
          tipo: inst.tipo || '',
          ubicacion: inst.ubicacion?.localidad
            ? `${inst.ubicacion.localidad}, ${inst.ubicacion.provincia}`
            : inst.ubicacion || '',
          carrerasDisponibles: carreras.length,
          carreras: carreras.map((c: any) => c.nombre || c),
        });
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    fetchInstitucion();
  }, [user]);

  if (loading) return <div className={styles.container}>Cargando institución...</div>;
  if (error)
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.card}>{error}</div>
      </div>
    );

  if (!institucion)
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.card}>No se encontró la institución.</div>
      </div>
    );

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{institucion.nombre}</h1>
        </div>
        <p className={styles.descripcion}>{institucion.descripcion}</p>
        <p>
          <b>Tipo:</b> {institucion.tipo}
        </p>
        <p>
          <b>Ubicación:</b> {institucion.ubicacion}
        </p>
        <p>
          <b>Carreras disponibles:</b> {institucion.carrerasDisponibles}
        </p>
        <button
          className={styles.editBtn}
          onClick={() => navigate(`/app/institucion/editar/${institucion.id}`)}
        >
          Editar institución
        </button>
      </div>
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Carreras disponibles</h2>
        <ul className={styles.carreraList}>
          {institucion.carreras?.map(carrera => (
            <li key={carrera} className={styles.carreraItem}>
              {carrera}
              <button
                className={styles.verBtn}
                onClick={() => navigate('/app/detalle-carrera')}
              >
                &rarr; Ver Carrera
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
