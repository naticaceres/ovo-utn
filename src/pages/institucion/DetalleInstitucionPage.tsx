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
  // Campos adicionales del endpoint
  sigla?: string;
  sitioWeb?: string;
  telefono?: string;
  mail?: string;
};

export default function DetalleInstitucionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [institucion, setInstitucion] = useState<Institucion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstitucion() {
      console.log('Current user:', user);

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

        console.log('Fetching institution with id:', id);
        const { data } = await api.get(`/api/v1/institutions/${id}`);
        console.log('API Response:', data);

        // Validar que la respuesta tenga la estructura esperada
        if (!data) {
          throw new Error('No se recibieron datos del servidor');
        }

        // El endpoint devuelve { institution: {...}, carreras: [] }
        const inst = data.institution;
        if (!inst) {
          throw new Error('No se encontraron datos de la institución');
        }

        const carreras = data.carreras || [];
        console.log('Institution data:', inst);
        console.log('Careers data:', carreras);

        setInstitucion({
          id: inst.id || 0,
          nombre: inst.nombre || 'Sin nombre',
          descripcion: inst.direccion || 'Sin descripción',
          tipo: inst.tipo || 'Universitaria',
          sigla: inst.sigla || '',
          sitioWeb: inst.sitioWeb || '',
          telefono: inst.telefono || '',
          mail: inst.mail || '',
          ubicacion: (() => {
            try {
              if (inst.ubicacion && typeof inst.ubicacion === 'object') {
                const loc = inst.ubicacion as Record<string, unknown>;
                const parts = [loc.localidad, loc.provincia, loc.pais].filter(
                  part => part && String(part).trim() !== ''
                );
                return parts.length > 0 ? parts.join(', ') : 'Sin ubicación';
              }
              // Fallback a otros campos si no hay ubicación
              const fallbackParts = [inst.sitioWeb, inst.telefono].filter(
                part => part && String(part).trim() !== ''
              );
              return fallbackParts.length > 0
                ? fallbackParts.join(' - ')
                : 'Sin ubicación';
            } catch (e) {
              console.warn('Error processing location:', e);
              return 'Sin ubicación';
            }
          })(),
          carrerasDisponibles: carreras.length,
          carreras: carreras.map((c: unknown, index: number) => {
            try {
              if (!c) return `Carrera ${index + 1}`;

              const carrera = c as Record<string, unknown>;
              const nombre =
                carrera.nombreCarrera ||
                carrera.tituloCarrera ||
                carrera.nombre ||
                `Carrera ${index + 1}`;

              return String(nombre);
            } catch (e) {
              console.warn('Error processing career:', e, c);
              return `Carrera ${index + 1}`;
            }
          }),
        });
      } catch (err) {
        console.error('Error fetching institution:', err);
        const errorMessage = getApiErrorMessage(err);
        setError(errorMessage || 'Error al cargar la institución');
      } finally {
        setLoading(false);
      }
    }

    fetchInstitucion();
  }, [user]);

  if (loading) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.card}>
          <p>Cargando institución...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.card}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!institucion) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.card}>
          <p>No se encontró la institución.</p>
          <button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {institucion.nombre}
            {institucion.sigla && <span> ({institucion.sigla})</span>}
          </h1>
        </div>
        {institucion.descripcion && (
          <p className={styles.descripcion}>{institucion.descripcion}</p>
        )}
        <div className={styles.details}>
          <p>
            <b>Tipo:</b> {institucion.tipo}
          </p>
          <p>
            <b>Ubicación:</b> {institucion.ubicacion}
          </p>
          {institucion.telefono && (
            <p>
              <b>Teléfono:</b> {institucion.telefono}
            </p>
          )}
          {institucion.mail && (
            <p>
              <b>Email:</b> {institucion.mail}
            </p>
          )}
          {institucion.sitioWeb && (
            <p>
              <b>Sitio web:</b>{' '}
              <a
                href={
                  institucion.sitioWeb.startsWith('http')
                    ? institucion.sitioWeb
                    : `https://${institucion.sitioWeb}`
                }
                target='_blank'
                rel='noopener noreferrer'
              >
                {institucion.sitioWeb}
              </a>
            </p>
          )}
          <p>
            <b>Carreras disponibles:</b> {institucion.carrerasDisponibles}
          </p>
        </div>
        <button
          className={styles.editBtn}
          onClick={() => navigate(`/app/institucion/profile`)}
        >
          Editar institución
        </button>
      </div>
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Carreras disponibles</h2>
        <ul className={styles.carreraList}>
          {institucion.carreras?.map((carrera, index) => (
            <li key={`${carrera}-${index}`} className={styles.carreraItem}>
              {carrera}
              <button
                className={styles.verBtn}
                onClick={() =>
                  navigate('/app/detalle-carrera', {
                    state: { carreraName: carrera },
                  })
                }
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
