// ...existing code...
import styles from './DetalleCarreraPage.module.css';
import { BackButton } from '../../components/ui/BackButton';
import ovoLogo from '../../assets/ovoLogo.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DetalleCarreraPage() {
  // Datos simulados, reemplaza por props o fetch si lo necesitas
  const carrera = {
    nombre: 'Ingeniería en sistemas FRM-UTN',
    cantidadMaterias: 30,
    fechaInicio: '6/1/2025',
    horasCursado: 120,
    montoCuota: 5,
    titulo: '1',
    observaciones: 'TEST',
    contenidoMultimedia: '',
    preguntasFrecuentes: '',
    modalidad: 'presencial',
  };
  const [favorito, setFavorito] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1 className={styles.title}>Detalle de Carrera</h1>
      </div>
      <div className={styles.card}>
        <h2 className={styles.carreraTitle}>{carrera.nombre}</h2>
        <div className={styles.infoList}>
          <p>
            <b>Cantidad de Materias:</b> {carrera.cantidadMaterias}
          </p>
          <p>
            <b>Fecha de Inicio:</b> {carrera.fechaInicio}
          </p>
          <p>
            <b>Horas de Cursado:</b> {carrera.horasCursado}
          </p>
          <p>
            <b>Monto de Cuota:</b> {carrera.montoCuota}
          </p>
          <p>
            <b>Título de la Carrera:</b> {carrera.titulo}
          </p>
          <p>
            <b>Observaciones:</b> {carrera.observaciones}
          </p>
          <p>
            <b>Contenido Multimedia:</b> {carrera.contenidoMultimedia}
          </p>
          <p>
            <b>Preguntas Frecuentes:</b> {carrera.preguntasFrecuentes}
          </p>
          <p>
            <b>Modalidad:</b> {carrera.modalidad}
          </p>
        </div>
        <div className={styles.buttonRow}>
          <button
            className={styles.favBtn}
            aria-label={
              favorito ? 'Quitar de favoritos' : 'Marcar como favorito'
            }
            onClick={() => setFavorito((f: boolean) => !f)}
          >
            {favorito ? (
              <span style={{ color: '#FFD700', fontSize: '1.5rem' }}>★</span>
            ) : (
              <span style={{ color: '#bbb', fontSize: '1.5rem' }}>☆</span>
            )}
            <span style={{ marginLeft: 8 }}>
              {favorito ? 'Favorito' : 'Marcar favorito'}
            </span>
          </button>

          <button
            className={styles.institutionBtn}
            style={{ marginLeft: '1rem' }}
            onClick={() => navigate('/app/detalle-institucion')}
          >
            &rarr; Ver Institución
          </button>
        </div>
      </div>
    </div>
  );
}
