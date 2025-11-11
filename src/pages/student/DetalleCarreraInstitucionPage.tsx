import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './DetalleCarreraInstitucionPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { getCareerInstitution } from '../../services/careers';
import { getInterests, addInterest, removeInterest } from '../../services/user';
import { useToast } from '../../components/ui/toast/useToast';

interface CarreraInstitucionResponse {
  acciones: {
    meInteresaPath: string;
  };
  carreraInstitucion: {
    duracion: number;
    horasCursado: number;
    id: number;
    modalidad: string;
    montoCuota: number;
    nombreCarrera: string;
    observaciones: string;
    tituloCarrera: string;
  };
  institucion: {
    direccion: string;
    id: number;
    mail: string;
    nombre: string;
    sigla: string;
    sitioWeb: string;
    telefono: string;
    urlLogo: string;
  };
  multimedia: Array<{
    idContenidoMultimedia: number;
    titulo: string;
    descripcion: string;
    enlace: string;
  }>;
  preguntasFrecuentes: Array<{
    idPreguntaFrecuente: number;
    nombrePregunta: string;
    respuesta: string;
  }>;
}

export default function DetalleCarreraInstitucionPage() {
  const { careerId, carreraInstitucionId } = useParams();
  const navigate = useNavigate();
  const [carreraInstitucion, setCarreraInstitucion] =
    useState<CarreraInstitucionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interestId, setInterestId] = useState<number | null>(null);
  const [interestLoading, setInterestLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchCarreraInstitucion() {
      // Verificar que tengamos ambos parámetros
      if (!careerId || !carreraInstitucionId) {
        setError('Parámetros faltantes');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Obteniendo detalle carrera-institución:', {
          careerId,
          carreraInstitucionId,
        });
        const data = await getCareerInstitution(
          careerId!,
          carreraInstitucionId!
        );

        console.log('Datos recibidos:', data);

        // La nueva API devuelve directamente la estructura esperada
        setCarreraInstitucion(data as CarreraInstitucionResponse);

        // Check if current user has this carreraInstitucion as interest
        try {
          const interests = await getInterests();
          const list = Array.isArray(interests) ? interests : [];

          // Buscar por idCarreraInstitucion
          const carreraInstId = (data as CarreraInstitucionResponse)
            .carreraInstitucion.id;

          console.log('Buscando interés para carrera ID:', carreraInstId);
          console.log('Lista de intereses del usuario:', list);

          const found = list.find((interest: Record<string, unknown>) => {
            const interestCarreraId = interest.idCarreraInstitucion;
            console.log('Comparando:', carreraInstId, 'con', interestCarreraId);
            return Number(interestCarreraId) === Number(carreraInstId);
          });

          console.log('Interés encontrado:', found);

          if (found) {
            const foundId = found.id || found._id || null;
            console.log('Estableciendo interestId:', foundId);
            setInterestId(foundId as number);
          } else {
            console.log('No se encontró interés, estableciendo null');
            setInterestId(null);
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
  }, [careerId, carreraInstitucionId]);

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

  const { institucion, carreraInstitucion: carreraInfo } = carreraInstitucion;

  return (
    <div className={styles.container}>
      <BackButton />

      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {carreraInfo.nombreCarrera} - {institucion.sigla}
          </h1>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Información de la Carrera</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Duración:</span>
              <span className={styles.value}>
                {carreraInfo.duracion || 'No especificado'} años
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Fecha de Inicio:</span>
              <span className={styles.value}>6/1/2025</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Horas de Cursado:</span>
              <span className={styles.value}>{carreraInfo.horasCursado}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Monto de Cuota:</span>
              <span className={styles.value}>${carreraInfo.montoCuota}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Título de la Carrera:</span>
              <span className={styles.value}>{carreraInfo.tituloCarrera}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Observaciones:</span>
              <span className={styles.value}>
                {carreraInfo.observaciones || 'Sin observaciones'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Modalidad:</span>
              <span className={styles.value}>{carreraInfo.modalidad}</span>
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
              {carreraInstitucion.multimedia.map(item => (
                <div
                  key={item.idContenidoMultimedia}
                  className={styles.multimediaItem}
                >
                  <h4 className={styles.multimediaTitle}>{item.titulo}</h4>
                  <p className={styles.multimediaDescription}>
                    {item.descripcion}
                  </p>
                  <a
                    href={item.enlace}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={styles.link}
                  >
                    Ver contenido
                  </a>
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
            {carreraInstitucion.preguntasFrecuentes &&
            carreraInstitucion.preguntasFrecuentes.length > 0 ? (
              <div className={styles.faqList}>
                {carreraInstitucion.preguntasFrecuentes.map(faq => (
                  <div key={faq.idPreguntaFrecuente} className={styles.faqItem}>
                    <h4 className={styles.faqQuestion}>{faq.nombrePregunta}</h4>
                    <p className={styles.faqAnswer}>{faq.respuesta}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noContent}>
                No hay preguntas frecuentes disponibles
              </p>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant='primary'
            onClick={async () => {
              if (!carreraInstitucion) return;

              const carreraInstId = carreraInfo.id;
              if (!carreraInstId) return;

              setInterestLoading(true);
              try {
                if (interestId) {
                  // remove
                  console.log('Removiendo interés con ID:', interestId);
                  await removeInterest(interestId);
                  setInterestId(null);
                  showToast('Interés eliminado', { variant: 'success' });
                } else {
                  console.log(
                    'Agregando interés para carrera ID:',
                    carreraInstId
                  );
                  const res = await addInterest({
                    idCarreraInstitucion: carreraInstId,
                  });
                  console.log('Respuesta al agregar interés:', res);

                  const r = res as unknown as Record<string, unknown>;
                  const newId = r['id'] ?? r['_id'] ?? r['insertedId'] ?? null;

                  console.log('Nuevo ID de interés:', newId);

                  if (
                    newId &&
                    (typeof newId === 'string' || typeof newId === 'number')
                  ) {
                    setInterestId(Number(newId));
                    console.log('InterestId actualizado a:', Number(newId));
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
            {(() => {
              const buttonText = interestLoading
                ? '...'
                : interestId
                  ? 'Quitar interés'
                  : 'Me interesa';
              console.log(
                'Estado del botón - interestId:',
                interestId,
                'texto:',
                buttonText
              );
              return buttonText;
            })()}
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              const instId = institucion.id;
              if (instId) {
                navigate(`/app/detalle-institucion/${instId}`);
              }
            }}
          >
            Ver Institución
          </Button>
        </div>
      </div>
    </div>
  );
}
