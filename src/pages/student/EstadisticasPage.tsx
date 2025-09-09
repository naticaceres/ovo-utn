import React, { useEffect, useState } from 'react';
import styles from './EstadisticasPage.module.css';
import { BackButton } from '../../components/ui/BackButton';

// Tipos para los datos
interface RankingFavoritas {
  nombre: string;
  cantidad: number;
}
interface RankingCompatibilidad {
  nombre: string;
  porcentaje: number;
}
interface CompatibilidadPorTipo {
  tipo: string;
  promedio: number;
}

export default function EstadisticasPage() {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [tipoCarrera, setTipoCarrera] = useState('Todas');
  const [rankingFavoritas, setRankingFavoritas] = useState<RankingFavoritas[]>(
    []
  );
  const [rankingCompatibilidad, setRankingCompatibilidad] = useState<
    RankingCompatibilidad[]
  >([]);
  const [compatibilidadPorTipo, setCompatibilidadPorTipo] = useState<
    CompatibilidadPorTipo[]
  >([]);
  const [cantidadCargadas, setCantidadCargadas] = useState(0);
  const [cantidadBaja, setCantidadBaja] = useState(0);

  useEffect(() => {
    // Aquí iría la llamada al backend para obtener los datos
    // Simulación de datos
    setRankingFavoritas([
      { nombre: 'Medicina', cantidad: 152 },
      { nombre: 'Ingeniería Informática', cantidad: 134 },
      { nombre: 'Psicología', cantidad: 121 },
    ]);
    setRankingCompatibilidad([
      { nombre: 'Ingeniería Informática', porcentaje: 98 },
      { nombre: 'Medicina', porcentaje: 95 },
      { nombre: 'Arquitectura', porcentaje: 93 },
    ]);
    setCompatibilidadPorTipo([
      { tipo: 'Salud', promedio: 80 },
      { tipo: 'Arte', promedio: 75 },
      { tipo: 'Humanidades', promedio: 60 },
      { tipo: 'Ciencias Sociales', promedio: 70 },
      { tipo: 'Ingeniería', promedio: 90 },
    ]);
    setCantidadCargadas(25);
    setCantidadBaja(3);
  }, []);

  return (
    <div>
      <BackButton />
      <div className={styles.tabs}>
        <button className={styles.activeTab}>Estadísticas generales</button>
        <button>Estadísticas por carrera</button>
      </div>
      <div className={styles.filters}>
        <input
          type='date'
          value={fechaDesde}
          onChange={e => setFechaDesde(e.target.value)}
          placeholder='Fecha desde'
        />
        <input
          type='date'
          value={fechaHasta}
          onChange={e => setFechaHasta(e.target.value)}
          placeholder='Fecha hasta'
        />
        <select
          value={tipoCarrera}
          onChange={e => setTipoCarrera(e.target.value)}
        >
          <option value='Todas'>Todas</option>
          <option value='Salud'>Salud</option>
          <option value='Arte'>Arte</option>
          <option value='Humanidades'>Humanidades</option>
          <option value='Ciencias Sociales'>Ciencias Sociales</option>
          <option value='Ingeniería'>Ingeniería</option>
        </select>
        <button className={styles.buscarBtn}>Buscar</button>
      </div>
      <div className={styles.statsRow}>
        <div className={styles.statsBox}>
          Cantidad de carreras cargadas: {cantidadCargadas}
        </div>
        <div className={styles.statsBox}>
          Cantidad de carreras dadas de baja: {cantidadBaja}
        </div>
      </div>
      <div className={styles.rankingsRow}>
        <div className={styles.rankingBox}>
          <h4>Ranking de carreras marcadas como favoritas</h4>
          <ul>
            {rankingFavoritas.map((item, idx) => (
              <li key={item.nombre}>
                <span className={styles.rankingNum}>{idx + 1}</span>{' '}
                {item.nombre}
                <span className={styles.rankingCount}>{item.cantidad}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.rankingBox}>
          <h4>Ranking según máxima compatibilidad obtenida</h4>
          <ul>
            {rankingCompatibilidad.map((item, idx) => (
              <li key={item.nombre}>
                <span className={styles.rankingNum}>{idx + 1}</span>{' '}
                {item.nombre}
                <span className={styles.rankingCount}>{item.porcentaje}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.chartBox}>
        <h4>Promedio de compatibilidades por tipo de carrera</h4>
        <div className={styles.barChart}>
          {compatibilidadPorTipo.map(item => (
            <div key={item.tipo} className={styles.barRow}>
              <span className={styles.barLabel}>{item.tipo}</span>
              <div
                className={styles.bar}
                style={{ width: `${item.promedio}%` }}
              >
                <span className={styles.barValue}>{item.promedio}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className={styles.exportBtn}>
        <span>Exportar</span>
      </button>
    </div>
  );
}
