// ...existing code...
import { useState } from 'react';
import styles from './ConsultarCarrerasPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';

const carreras = [
  {
    nombre: 'Ingeniería en Sistemas',
    instituciones: ['UTN Mendoza', 'UTN Buenos Aires'],
  },
  {
    nombre: 'Ingeniería Industrial',
    instituciones: ['UTN Córdoba', 'UTN Santa Fe'],
  },
  // ...puedes agregar más carreras
];

export default function ConsultarCarrerasPage() {
  const [query, setQuery] = useState('');
  const [selectedCarrera, setSelectedCarrera] = useState<string | null>(null);
  const carrerasFiltradas = carreras.filter(c =>
    c.nombre.toLowerCase().includes(query.toLowerCase())
  );
  const carreraSeleccionada = carreras.find(c => c.nombre === selectedCarrera);
  const navigate = useNavigate();

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
          {carrerasFiltradas.length === 0 && (
            <li className={styles.noResult}>No se encontraron carreras</li>
          )}
          {carrerasFiltradas.map(c => (
            <li
              key={c.nombre}
              className={
                selectedCarrera === c.nombre
                  ? styles.selected
                  : styles.carreraItem
              }
              onClick={() => setSelectedCarrera(c.nombre)}
              style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
            >
              {c.nombre}
            </li>
          ))}
        </ul>
      </div>
      {carreraSeleccionada && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>
            Instituciones con {carreraSeleccionada.nombre}
          </h2>
          <ul className={styles.institutions}>
            {carreraSeleccionada.instituciones.map(inst => (
              <li
                key={inst}
                style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
                onClick={() => navigate('/app/detalle-carrera')}
              >
                {inst}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
