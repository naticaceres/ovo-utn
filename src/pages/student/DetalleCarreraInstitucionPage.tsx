import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './DetalleCarreraInstitucionPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { getCareerInstitution } from '../../services/careers';
import { getInterests, addInterest, removeInterest } from '../../services/user';
import { useToast } from '../../components/ui/toast/useToast';

interface CarreraInstitucion {
  id: number;
  duracion: number;
  horasCursado: number;
  modalidad: string;
  montoCuota: number;
  nombreCarrera: string;
  observaciones: string;
  tituloCarrera: string;
  institucion: {
    id: number;
    direccion: string;
    mail: string;
    nombre: string;
    sigla: string;
    sitioWeb: string;
    telefono: string;
    urlLogo: string;
  };
  multimedia: unknown[];
}

export default function DetalleCarreraInstitucionPage() {
  const { careerId, institutionId } = useParams();
  const navigate = useNavigate();
  const [carreraInstitucion, setCarreraInstitucion] =
    useState<CarreraInstitucion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interestId, setInterestId] = useState<number | null>(null);
  const [interestLoading, setInterestLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchCarreraInstitucion() {
      if (!careerId || !institutionId) {
        setError('Parámetros faltantes');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Obteniendo detalle carrera-institución:', {
          careerId,
          institutionId,
        });

        const data = await getCareerInstitution(careerId, institutionId);
        console.log('Datos recibidos:', data);

        // Normalizar respuestas que pueden venir envueltas
        // Algunos endpoints devuelven: { carreraInstitucion: {...}, institucion: {...}, multimedia: [...] }
        // Otros devuelven directamente el objeto de detalle.
        let normalized: Record<string, unknown> = {};
        if (data && typeof data === 'object') {
          const d = data as Record<string, unknown>;
          if (
            d['carreraInstitucion'] &&
            typeof d['carreraInstitucion'] === 'object'
          ) {
            normalized = {
              ...(d['carreraInstitucion'] as Record<string, unknown>),
            };
            // Attach institucion object if present
            if (d['institucion'] && typeof d['institucion'] === 'object')
              normalized.institucion = d['institucion'];
            else if (!normalized.institucion) normalized.institucion = {};
          } else {
            normalized = d;
          }
        }

        setCarreraInstitucion(normalized as unknown as CarreraInstitucion);

        // Check if current user has this carreraInstitucion as interest
        try {
          const interests = await getInterests();
          // interests may be an array or an object with a `data` field
          const list = Array.isArray(interests)
            ? (interests as unknown as Record<string, unknown>[])
            : Array.isArray(
                  (interests as unknown as Record<string, unknown>)?.data
                )
              ? ((interests as unknown as Record<string, unknown>)[
                  'data'
                ] as Record<string, unknown>[])
              : [];
          const normIdCandidates = [
            (normalized as Record<string, unknown>)['id'],
            (normalized as Record<string, unknown>)['idCarreraInstitucion'],
            (normalized as Record<string, unknown>)['idCarrera'],
          ].filter(Boolean);

          const found = (list as Record<string, unknown>[]).find(it => {
            try {
              const val =
                (it as Record<string, unknown>)['idCarreraInstitucion'] ??
                (it as Record<string, unknown>)['id'];
              return normIdCandidates.some(c => String(c) === String(val));
            } catch {
              return false;
            }
          });
          if (found) {
            const f = found as Record<string, unknown>;
            setInterestId((f['id'] as number) || (f['_id'] as number) || null);
          }
        } catch (e) {
          console.warn('No se pudieron cargar intereses del usuario', e);
        }
      } catch (err) {
        console.error('Error al cargar detalle carrera-institución:', err);
        setError('No se pudo cargar la información de la carrera');
      } finally {
        setLoading(false);
      }
    }

    fetchCarreraInstitucion();
  }, [careerId, institutionId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.card}>
          <p>Cargando información...</p>
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
          <Button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  if (!carreraInstitucion) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.card}>
          <p>No se encontró la información solicitada.</p>
        </div>
      </div>
    );
  }

  const { institucion } = carreraInstitucion;

  return (
    <div className={styles.container}>
      <BackButton />

      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {carreraInstitucion.nombreCarrera} - {institucion.sigla}
          </h1>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Información de la Carrera</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Cantidad de Materias:</span>
              <span className={styles.value}>
                {carreraInstitucion.duracion || 'No especificado'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Fecha de Inicio:</span>
              <span className={styles.value}>6/1/2025</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Horas de Cursado:</span>
              <span className={styles.value}>
                {carreraInstitucion.horasCursado}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Monto de Cuota:</span>
              <span className={styles.value}>
                ${carreraInstitucion.montoCuota}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Título de la Carrera:</span>
              <span className={styles.value}>
                {carreraInstitucion.tituloCarrera}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Observaciones:</span>
              <span className={styles.value}>
                {carreraInstitucion.observaciones || 'Sin observaciones'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Modalidad:</span>
              <span className={styles.value}>
                {carreraInstitucion.modalidad}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Información de la Institución</h2>
          <div className={styles.institutionInfo}>
            <h3 className={styles.institutionName}>{institucion.nombre}</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Dirección:</span>
                <span className={styles.value}>{institucion.direccion}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{institucion.mail}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Teléfono:</span>
                <span className={styles.value}>{institucion.telefono}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Sitio Web:</span>
                <span className={styles.value}>
                  <a
                    href={
                      institucion.sitioWeb.startsWith('http')
                        ? institucion.sitioWeb
                        : `https://${institucion.sitioWeb}`
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className={styles.link}
                  >
                    {institucion.sitioWeb}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Contenido Multimedia:</h2>
          {carreraInstitucion.multimedia &&
          carreraInstitucion.multimedia.length > 0 ? (
            <div className={styles.multimedia}>
              {carreraInstitucion.multimedia.map((_, index) => (
                <div key={index} className={styles.multimediaItem}>
                  {/* Aquí se pueden agregar diferentes tipos de multimedia */}
                  <p>Contenido multimedia {index + 1}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noContent}>
              No hay contenido multimedia disponible
            </p>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Preguntas Frecuentes:</h2>
          <div className={styles.faqSection}>
            <p className={styles.noContent}>
              No hay preguntas frecuentes disponibles
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant='primary'
            onClick={async () => {
              if (!carreraInstitucion) return;
              // Determine id of carreraInstitucion
              const cif = carreraInstitucion as unknown as Record<
                string,
                unknown
              >;
              const cid =
                cif['id'] ?? cif['idCarreraInstitucion'] ?? cif['idCarrera'];
              if (!cid) return;
              setInterestLoading(true);
              try {
                if (interestId) {
                  // remove
                  await removeInterest(interestId);
                  setInterestId(null);
                  showToast('Interés eliminado', { variant: 'success' });
                } else {
                  const res = await addInterest({ idCarreraInstitucion: cid });
                  const r = res as unknown as Record<string, unknown>;
                  const newId = r['id'] ?? r['_id'] ?? r['insertedId'] ?? null;
                  if (
                    newId &&
                    (typeof newId === 'string' || typeof newId === 'number')
                  ) {
                    setInterestId(Number(newId));
                  }
                  showToast('Interés agregado', { variant: 'success' });
                }
              } catch (e) {
                console.error('Error toggling interest', e);
                showToast('Error al cambiar interés', { variant: 'error' });
              } finally {
                setInterestLoading(false);
              }
            }}
          >
            {interestLoading
              ? '...'
              : interestId
                ? 'Quitar interés'
                : 'Me interesa'}
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              let instId: string | number | undefined;
              if (institucion && typeof institucion === 'object') {
                const r = institucion as Record<string, unknown>;
                instId =
                  (r['id'] as string | number | undefined) ||
                  (r['idInstitucion'] as string | number | undefined);
              }
              if (instId) navigate(`/app/detalle-institucion/${instId}`);
              else navigate(`/app/detalle-institucion/${institutionId}`);
            }}
          >
            Ver Institución
          </Button>
        </div>
      </div>
    </div>
  );
}
