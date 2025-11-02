import { useEffect, useState } from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import styles from './FavoriteCareersPage.module.css';
import { getInterests, removeInterest } from '../../services/user';
import { setCareerInterest } from '../../services/careers';
import { useNavigate } from 'react-router-dom';

interface Carrera {
  id?: number | string;
  idCarreraInstitucion: number;
  nombreCarreraInstitucion: string;
  nombreInstitucion: string;
}

export default function FavoriteCareersPage() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | string | null>(
    null
  );
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInterests();
      console.log('Datos de intereses recibidos:', data);
      // esperar que data sea array de carreras
      setCarreras(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar intereses:', err);
      setError('No tiene preferencia por ninguna carrera');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUnmark = async (id: number | string) => {
    setProcessingId(id);
    setError(null);
    try {
      // intenta usar removeInterest; si no existe usa setCareerInterest
      if (typeof removeInterest === 'function') {
        await removeInterest(id);
      } else {
        // backend API exposes setCareerInterest(careerId)
        await setCareerInterest(id);
      }
      // actualizar UI localmente
      setCarreras(prev =>
        prev.filter(c => String(c.idCarreraInstitucion) !== String(id))
      );
    } catch {
      setError('No se pudo quitar el interés. Intente de nuevo.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>Carreras que te interesan</h1>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : !carreras || carreras.length === 0 ? (
        <div className={styles.empty}>
          <p>No tenés carreras marcadas como de interés.</p>
          <Button
            variant='outline'
            onClick={() => navigate('/app/student/carreras')}
          >
            Explorar carreras
          </Button>
        </div>
      ) : (
        <ul className={styles.list}>
          {carreras.map(c => (
            <li key={c.idCarreraInstitucion} className={styles.item}>
              <div>
                <div className={styles.name}>{c.nombreCarreraInstitucion}</div>
                <div className={styles.sub}>{c.nombreInstitucion}</div>
              </div>
              <div className={styles.actions}>
                <Button
                  variant='primary'
                  onClick={() =>
                    navigate(
                      `/app/student/carrera-detalle/${c.idCarreraInstitucion}`
                    )
                  }
                >
                  Ver detalles
                </Button>
                <Button
                  variant='outline'
                  onClick={() => handleUnmark(c.idCarreraInstitucion)}
                  disabled={processingId === c.idCarreraInstitucion}
                  isLoading={processingId === c.idCarreraInstitucion}
                >
                  Quitar interés
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
