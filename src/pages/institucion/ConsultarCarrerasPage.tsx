// ...existing code...
import { useState, useEffect } from 'react';
import styles from './ConsultarCarrerasPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import {
  listCareers,
  searchCareers,
  getCareerInstitutions,
} from '../../services/careers';

interface Carrera {
  id?: number | string;
  nombre: string;
  instituciones?: string[];
}

interface Institution {
  id?: number | string;
  nombre?: string;
}

export default function ConsultarCarrerasPage() {
  const [query, setQuery] = useState('');
  const [selectedCarrera, setSelectedCarrera] = useState<
    number | string | null
  >(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listCareers()
      .then(data => {
        if (!mounted) return;
        setCarreras(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('No se pudieron cargar las carreras'))
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!query) return;
      setLoading(true);
      searchCareers(query)
        .then(data => setCarreras(Array.isArray(data) ? data : []))
        .catch(() => setError('Error al buscar'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(id);
  }, [query]);
  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1 className={styles.title}>Catálogo de Carreras</h1>
      </div>
      <div className={styles.searchCard}>
        <h2 className={styles.sectionTitle}>Carreras</h2>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>

          <input
            type='text'
            placeholder='Buscar carrera...'
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedCarrera(null);
            }}
            className={styles.input}
          />
        </div>

        <ul className={styles.carreraList}>
          {loading && <li className={styles.noResult}>Cargando...</li>}
          {!loading && carreras.length === 0 && (
            <li className={styles.noResult}>No se encontraron carreras</li>
          )}
          {carreras.map(c => (
            <li
              key={c.id || c.nombre}
              className={
                selectedCarrera === (c.id || c.nombre)
                  ? styles.selected
                  : styles.carreraItem
              }
              onClick={async () => {
                setSelectedCarrera(c.id || c.nombre);
                setInstitutions([]);
                try {
                  const inst = await getCareerInstitutions(c.id || c.nombre);
                  setInstitutions(Array.isArray(inst) ? inst : []);
                } catch {
                  setError('No se pudieron cargar las instituciones');
                }
              }}
              style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
            >
              {c.nombre}
            </li>
          ))}
        </ul>
      </div>
      {selectedCarrera && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Instituciones</h2>
          {institutions.length === 0 ? (
            <div>No se encontraron instituciones</div>
          ) : (
            <ul className={styles.institutions}>
              {institutions.map(inst => (
                <li
                  key={inst.id || String(inst.nombre)}
                  style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
                  onClick={() => navigate('/app/detalle-carrera')}
                >
                  {inst.nombre || String(inst)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {error && (
        <div style={{ color: 'var(--color-accent-2)', marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
