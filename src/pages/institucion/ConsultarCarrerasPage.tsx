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
  idCarrera?: number | string;
  nombre: string;
  instituciones?: string[];
}

interface Institution {
  id?: number | string;
  idInstitucion?: number | string;
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
        console.log('Carreras recibidas del backend:', data);

        const carrerasArray = Array.isArray(data) ? data : [];
        console.log('Carreras procesadas:', carrerasArray);

        // Log de la primera carrera para ver su estructura
        if (carrerasArray.length > 0) {
          console.log('Estructura de la primera carrera:', carrerasArray[0]);
          console.log('Campos disponibles:', Object.keys(carrerasArray[0]));
        }

        setCarreras(carrerasArray);
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
        .then(data => {
          console.log('Resultados de búsqueda:', data);
          const carrerasArray = Array.isArray(data) ? data : [];

          if (carrerasArray.length > 0) {
            console.log('Primera carrera de búsqueda:', carrerasArray[0]);
          }

          setCarreras(carrerasArray);
        })
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
              setInstitutions([]); // También limpiar instituciones
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
              key={c.id || c.idCarrera || c.nombre}
              className={
                selectedCarrera === (c.id || c.idCarrera || c.nombre)
                  ? styles.selected
                  : styles.carreraItem
              }
              onClick={async () => {
                console.log('Carrera seleccionada:', c);
                console.log('Todos los campos de la carrera:', Object.keys(c));

                // Buscar el ID de la carrera con múltiples nombres posibles
                const carreraId = c.id || c.idCarrera || c.nombre;

                console.log('ID de carrera encontrado:', carreraId);
                console.log('Nombre de carrera:', c.nombre);

                if (!carreraId) {
                  console.error('No se encontró ID de carrera válido');
                  setError('Error: La carrera no tiene un ID válido');
                  return;
                }

                setSelectedCarrera(carreraId);
                setInstitutions([]);
                setError(null);

                try {
                  console.log(
                    'Buscando instituciones para carrera ID:',
                    carreraId
                  );

                  const inst = await getCareerInstitutions(carreraId);
                  console.log('Instituciones recibidas:', inst);

                  // Verificar que las instituciones tengan IDs
                  const institutionsWithIds = Array.isArray(inst)
                    ? inst.map((institution, index) => {
                        console.log('Institución:', institution);
                        return {
                          ...institution,
                          id:
                            institution.id ||
                            institution.idInstitucion ||
                            index,
                        };
                      })
                    : [];

                  console.log('Instituciones procesadas:', institutionsWithIds);
                  setInstitutions(institutionsWithIds);
                } catch (err) {
                  console.error('Error al cargar instituciones:', err);
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
                  onClick={() => {
                    const carreraId = selectedCarrera; // Ya es el ID numérico
                    const institucionId = inst.id || inst.idInstitucion;

                    console.log('Navegando a detalle:', {
                      carreraId,
                      institucionId,
                    });
                    console.log('Institución completa:', inst);

                    if (!carreraId || !institucionId) {
                      console.error('Faltan IDs para navegar:', {
                        carreraId,
                        institucionId,
                      });
                      setError(
                        'Error: No se pueden obtener los identificadores necesarios'
                      );
                      return;
                    }

                    navigate(
                      `/app/student/carrera-institucion/${carreraId}/${institucionId}`
                    );
                  }}
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
