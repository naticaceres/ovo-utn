import React, { useEffect, useState } from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './FavoriteCareersPage.module.css';
import { getInterests, removeInterest } from '../../services/user';
import { setCareerInterest } from '../../services/careers';
import { useNavigate } from 'react-router-dom';

interface Carrera {
  id?: number | string;
  idCarreraInstitucion: number;
  nombreCarreraInstitucion: string;
  nombreInstitucion: string;
  titulo?: string;
  estado?: string;
}

export default function FavoriteCareersPage() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | string | null>(
    null
  );
  const navigate = useNavigate();
  const [filterNombre, setFilterNombre] = useState('');
  const [filterTitulo, setFilterTitulo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

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

  // Función para filtrar carreras
  const filteredCarreras = React.useMemo(() => {
    return carreras.filter(c => {
      const matchNombre =
        !filterNombre ||
        c.nombreCarreraInstitucion
          ?.toLowerCase()
          .includes(filterNombre.toLowerCase()) ||
        c.nombreInstitucion?.toLowerCase().includes(filterNombre.toLowerCase());

      const matchTitulo =
        !filterTitulo ||
        c.titulo?.toLowerCase().includes(filterTitulo.toLowerCase());

      const matchEstado =
        !filterEstado ||
        c.estado?.toLowerCase().includes(filterEstado.toLowerCase());

      return matchNombre && matchTitulo && matchEstado;
    });
  }, [carreras, filterNombre, filterTitulo, filterEstado]);

  const clearFilters = () => {
    setFilterNombre('');
    setFilterTitulo('');
    setFilterEstado('');
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
        <>
          {/* Filtros */}
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                🔍 Filtros
              </h3>
              {(filterNombre || filterTitulo || filterEstado) && (
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  style={{ fontSize: '12px', padding: '4px 12px' }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >
              <Input
                label='Nombre'
                placeholder='Buscar por nombre de carrera o institución...'
                value={filterNombre}
                onChange={e => setFilterNombre(e.target.value)}
                fullWidth
              />
              <Input
                label='Título'
                placeholder='Buscar por título...'
                value={filterTitulo}
                onChange={e => setFilterTitulo(e.target.value)}
                fullWidth
              />
              <Input
                label='Estado'
                placeholder='Buscar por estado...'
                value={filterEstado}
                onChange={e => setFilterEstado(e.target.value)}
                fullWidth
              />
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Mostrando <strong>{filteredCarreras.length}</strong> de{' '}
              <strong>{carreras.length}</strong> carreras
            </div>
          </div>

          <ul className={styles.list}>
            {filteredCarreras.map(c => (
              <li key={c.idCarreraInstitucion} className={styles.item}>
                <div>
                  <div className={styles.name}>
                    {c.nombreCarreraInstitucion}
                  </div>
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
        </>
      )}
    </div>
  );
}
