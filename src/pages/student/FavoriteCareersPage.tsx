import { useEffect, useState } from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import styles from './FavoriteCareersPage.module.css';
import { getInterests, removeInterest } from '../../services/user';
import { setCareerInterest } from '../../services/careers';
import { useNavigate } from 'react-router-dom';

interface Carrera {
  id: number | string;
  nombre: string;
  // otros campos opcionales según respuesta:
  instituciones?: string[];
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
      // esperar que data sea array de carreras
      setCarreras(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar las carreras favoritas');
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
        await setCareerInterest(id, false);
      }
      // actualizar UI localmente
      setCarreras(prev => prev.filter(c => String(c.id) !== String(id)));
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
      ) : carreras.length === 0 ? (
        <div className={styles.empty}>
          No tenés carreras marcadas. <br />
          <Button
            variant='outline'
            onClick={() => navigate('/app/student/carreras')}
          >
            Ir a buscar carreras
          </Button>
        </div>
      ) : (
        <ul className={styles.list}>
          {carreras.map(c => (
            <li key={c.id} className={styles.item}>
              <div>
                <div className={styles.name}>{c.nombre}</div>
                {c.instituciones && c.instituciones.length > 0 && (
                  <div className={styles.sub}>{c.instituciones.join(', ')}</div>
                )}
              </div>
              <div className={styles.actions}>
                <Button
                  variant='outline'
                  onClick={() => handleUnmark(c.id)}
                  disabled={processingId === c.id}
                  isLoading={processingId === c.id}
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
