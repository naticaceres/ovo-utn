// ...existing code...
import { useState, useEffect } from 'react';
import styles from './ConsultarCarrerasPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import { api } from '../../context/api';

interface CarreraInstitucion {
  idCarreraInstitucion: number;
  nombreCarrera: string;
  nombreInstitucion: string;
  modalidad: string;
  montoCuota: number;
  tituloCarrera: string;
  urlLogo: string;
  detailPath: string;
  meInteresaPath: string;
}

// Función para obtener todas las carreras con instituciones
async function getAllCarrerasInstituciones() {
  try {
    // Primero obtenemos la lista de carreras
    const carrerasResponse = await api.get('/api/v1/careers');
    const carreras = Array.isArray(carrerasResponse.data)
      ? carrerasResponse.data
      : [];

    // Luego obtenemos las instituciones para cada carrera
    const allCarrerasInstituciones: CarreraInstitucion[] = [];

    for (const carrera of carreras) {
      try {
        const carreraId = carrera.id || carrera.idCarrera;
        if (carreraId) {
          const instResponse = await api.get(
            `/api/v1/careers/${carreraId}/institutions`
          );
          const instituciones = Array.isArray(instResponse.data)
            ? instResponse.data
            : [];
          allCarrerasInstituciones.push(...instituciones);
        }
      } catch (error) {
        console.warn(
          `Error al obtener instituciones para carrera ${carrera.id}:`,
          error
        );
      }
    }

    return allCarrerasInstituciones;
  } catch (error) {
    console.error('Error al obtener carreras-instituciones:', error);
    throw error;
  }
}

export default function ConsultarCarrerasPage() {
  const [query, setQuery] = useState('');
  const [carrerasInstituciones, setCarrerasInstituciones] = useState<
    CarreraInstitucion[]
  >([]);
  const [filteredCarrerasInstituciones, setFilteredCarrerasInstituciones] =
    useState<CarreraInstitucion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getAllCarrerasInstituciones()
      .then(data => {
        if (!mounted) return;
        console.log('Carreras-Instituciones recibidas:', data);
        setCarrerasInstituciones(data);
        setFilteredCarrerasInstituciones(data);
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
    if (!query) {
      setFilteredCarrerasInstituciones(carrerasInstituciones);
    } else {
      const filtered = carrerasInstituciones.filter(
        carreraInst =>
          carreraInst.nombreCarrera
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          carreraInst.nombreInstitucion
            .toLowerCase()
            .includes(query.toLowerCase())
      );
      setFilteredCarrerasInstituciones(filtered);
    }
  }, [query, carrerasInstituciones]);
  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1 className={styles.title}>Catálogo de Carreras</h1>
      </div>

      <div className={styles.searchCard}>
        <h2 className={styles.sectionTitle}>Carreras e Instituciones</h2>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type='text'
            placeholder='Buscar por carrera o institución...'
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={styles.input}
          />
        </div>

        {loading && (
          <div className={styles.noResult}>
            Cargando carreras e instituciones...
          </div>
        )}

        {!loading && filteredCarrerasInstituciones.length === 0 && (
          <div className={styles.noResult}>No se encontraron carreras</div>
        )}

        {!loading && filteredCarrerasInstituciones.length > 0 && (
          <ul className={styles.institutions}>
            {filteredCarrerasInstituciones.map(carreraInst => (
              <li
                key={carreraInst.idCarreraInstitucion}
                className={styles.institutionItem}
                onClick={() => {
                  console.log('Navegando a detalle:', carreraInst);

                  // Extraer idCarrera del detailPath y usar idCarreraInstitucion directamente
                  // detailPath tiene formato: "/api/v1/careers/<idCarrera>/institutions/<idCarreraInstitucion>"
                  const pathParts = carreraInst.detailPath.split('/');
                  const carreraId = pathParts[pathParts.length - 3]; // careers/ID/institutions
                  const carreraInstitucionId = carreraInst.idCarreraInstitucion;

                  console.log('IDs extraídos:', {
                    carreraId,
                    carreraInstitucionId,
                  });

                  navigate(
                    `/app/student/carrera-institucion/${carreraId}/${carreraInstitucionId}`
                  );
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.institutionContent}>
                  <div className={styles.institutionHeader}>
                    <h4 className={styles.institutionName}>
                      {carreraInst.nombreCarrera}
                    </h4>
                    <span className={styles.modalidad}>
                      {carreraInst.modalidad}
                    </span>
                  </div>
                  <div className={styles.institutionDetails}>
                    <span className={styles.titulo}>
                      📍 {carreraInst.nombreInstitucion}
                    </span>
                    <span className={styles.cuota}>
                      Cuota: ${carreraInst.montoCuota}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div style={{ color: 'var(--color-accent-2)', marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
