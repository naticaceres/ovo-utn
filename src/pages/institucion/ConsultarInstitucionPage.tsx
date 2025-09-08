import styles from './ConsultarInstitucionPage.module.css';
import { useState } from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import ovoLogo from '../../assets/ovoLogo.svg';

const instituciones = [
  {
    nombre: 'UTN MZA',
    sede: 'UTN Mendoza',
    descripcion: 'Universidad Tecnológica Nacional - Facultad Regional Mendoza',
    carreras: 5,
    ubicacion: 'Godoy Cruz, Mendoza',
    tipo: 'Pública',
    logo: ovoLogo,
  },
  {
    nombre: 'UNC',
    sede: 'UNC Córdoba',
    descripcion: 'Universidad Nacional de Córdoba',
    carreras: 10,
    ubicacion: 'Córdoba, Córdoba',
    tipo: 'Pública',
    logo: 'https://imglab.com/imagen/unc',
  },
  {
    nombre: 'UCA',
    sede: 'UCA Buenos Aires',
    descripcion: 'Universidad Católica Argentina - Sede Buenos Aires',
    carreras: 7,
    ubicacion: 'Palermo, Buenos Aires',
    tipo: 'Privada',
    logo: 'https://imglab.com/imagen/uca',
  },
];

export default function ConsultarInstitucionPage() {
  const [filtro, setFiltro] = useState('');
  const navigate = useNavigate();
  const institucionesFiltradas = instituciones.filter(
    inst =>
      inst.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      inst.sede.toLowerCase().includes(filtro.toLowerCase()) ||
      inst.ubicacion.toLowerCase().includes(filtro.toLowerCase()) ||
      inst.tipo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.searchBox}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.input}
          type='text'
          placeholder='Filtrar por nombre, tipo o ubicación...'
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>
      <div className={styles.cardsGrid}>
        {institucionesFiltradas.map(inst => (
          <div
            key={inst.nombre}
            className={styles.card}
            onClick={() => navigate('/app/detalle-institucion')}
          >
            <div className={styles.cardHeader}>
              <img src={inst.logo} alt={inst.nombre} className={styles.logo} />
              <div>
                <h2 className={styles.cardTitle}>{inst.nombre}</h2>
                <span className={styles.cardSede}>{inst.sede}</span>
              </div>
            </div>
            <p className={styles.descripcion}>{inst.descripcion}</p>
            <p>
              <b>Carreras:</b> {inst.carreras}
            </p>
            <p>
              <b>Ubicación:</b> {inst.ubicacion}
            </p>
            <p>
              <b>Tipo:</b> {inst.tipo}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
