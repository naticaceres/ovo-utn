import styles from './DetalleInstitucionPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '../../context/api';
import { useAuth } from '../../context/use-auth';
import { useParams } from 'react-router-dom';

type Institucion = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  tipo?: string;
  ubicacion?: string;
  carrerasDisponibles?: number;
  carreras?: string[];
  carrerasRaw?: Record<string, unknown>[];
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
  const { id: routeId } = useParams<{ id?: string }>();

  useEffect(() => {
    async function fetchInstitucion() {
      console.log('Current user:', user, 'routeId:', routeId);

      setLoading(true);
      setError(null);

      try {
        // Prefer route param id when present (student is viewing another institution)
        const institutionId =
          routeId ??
          (user && user.usuario?.id !== undefined
            ? String(user.usuario.id)
            : undefined);

        if (!institutionId) {
          setError('No hay identificador de institución disponible');
          setLoading(false);
          return;
        }

        console.log('Fetching institution with id:', institutionId);
        const { data } = await api.get(`/api/v1/institutions/${institutionId}`);
        console.log('API Response:', data);

        // Validar que la respuesta tenga la estructura esperada
        if (!data) {
          throw new Error('No se recibieron datos del servidor');
        }

        // El endpoint puede devolver varias formas:
        // - { id, ... , carreras: [...] }
        // - { institucion: { id, ... }, carreras: [...] }
        // - { institution: { id, ... }, carreras: [...] }
        // Normalizamos para siempre trabajar con `inst` y `carreras`.
        let inst: Record<string, unknown> = data as Record<string, unknown>;
        if (data && typeof data === 'object') {
          if (data['institucion']) inst = data['institucion'];
          else if (data['institution']) inst = data['institution'];
          else if (data['data']) inst = data['data'];
        }

        if (!inst || !(inst.id || inst.idInstitucion)) {
          throw new Error('No se encontraron datos de la institución');
        }

        // Extraer carreras: pueden venir en root.carreras o en inst.carreras
        const carreras = Array.isArray(data?.carreras)
          ? data.carreras
          : Array.isArray(inst?.carreras)
            ? inst.carreras
            : [];
        console.log('Institution data:', inst);
        console.log('Careers data:', carreras);

        const get = (key: string) =>
          inst && (inst as Record<string, unknown>)[key]
            ? (inst as Record<string, unknown>)[key]
            : undefined;

        setInstitucion({
          id: Number(get('id') || get('idInstitucion') || 0),
          nombre: String(
            get('nombre') || get('nombreInstitucion') || 'Sin nombre'
          ),
          descripcion:
            get('descripcion') !== undefined
              ? (get('descripcion') as string | null)
              : get('direccion')
                ? String(get('direccion'))
                : null,
          tipo: String(get('tipo') || 'Universitaria'),
          sigla: String(get('sigla') || ''),
          sitioWeb: String(get('sitioWeb') || ''),
          telefono: String(get('telefono') || ''),
          mail: String(get('mail') || ''),
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
          carrerasRaw: Array.isArray(carreras)
            ? (carreras as Record<string, unknown>[])
            : [],
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
  }, [user, routeId]);

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
        {/* Only allow editing when logged user is an institution user and owns this institution */}
        {user &&
          user.grupos?.some(g => g.toLowerCase().includes('institucion')) &&
          institucion &&
          Number(user.usuario.id) === Number(institucion.id) && (
            <button
              className={styles.editBtn}
              onClick={() => navigate(`/app/institucion/profile`)}
            >
              Editar institución
            </button>
          )}
      </div>
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Carreras disponibles</h2>
        <ul className={styles.carreraList}>
          {institucion.carreras?.map((carrera, index) => (
            <li key={`${carrera}-${index}`} className={styles.carreraItem}>
              {carrera}
              <button
                className={styles.verBtn}
                onClick={() => {
                  // Try to get career id from carrerasRaw if available
                  const raw =
                    institucion.carrerasRaw && institucion.carrerasRaw[index];
                  let careerId: string | number | undefined;
                  if (raw && typeof raw === 'object') {
                    careerId = (raw as Record<string, unknown>)['idCarrera'] as
                      | string
                      | number
                      | undefined;
                    if (!careerId)
                      careerId = (raw as Record<string, unknown>)['id'] as
                        | string
                        | number
                        | undefined;
                    if (!careerId)
                      careerId = (raw as Record<string, unknown>)[
                        'idCarreraInstitucion'
                      ] as string | number | undefined;
                  }

                  const institutionId = institucion.id;
                  if (careerId && institutionId) {
                    navigate(
                      `/app/student/carrera-institucion/${careerId}/${institutionId}`
                    );
                  } else {
                    // Fallback: go to carrera detail or show message
                    navigate('/app/detalle-carrera', {
                      state: { carreraName: carrera },
                    });
                  }
                }}
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
