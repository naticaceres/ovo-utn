import styles from './DetalleInstitucionPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';

export default function DetalleInstitucionPage() {
  // Datos simulados
  const navigate = useNavigate();
  const institucion = {
    nombre: 'UTN MZA - UTN Mendoza',
    descripcion: 'Universidad Tecnológica Nacional - Facultad Regional Mendoza',
    tipo: 'Pública',
    ubicacion: 'Godoy Cruz, Mendoza, Argentina',
    carrerasDisponibles: 5,
    carreras: [
      'Ingeniería en Sistemas',
      'Arquitectura',
      'Industrial',
      'Química',
      'Civil',
    ],
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{institucion.nombre}</h1>
        </div>
        <p className={styles.descripcion}>{institucion.descripcion}</p>
        <p>
          <b>Tipo:</b> {institucion.tipo}
        </p>
        <p>
          <b>Ubicación:</b> {institucion.ubicacion}
        </p>
        <p>
          <b>Carreras disponibles:</b> {institucion.carrerasDisponibles}
        </p>
      </div>
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Carreras disponibles</h2>
        <ul className={styles.carreraList}>
          {institucion.carreras.map(carrera => (
            <li key={carrera} className={styles.carreraItem}>
              {carrera}
              <button
                className={styles.verBtn}
                onClick={() => navigate('/app/detalle-carrera')}
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
