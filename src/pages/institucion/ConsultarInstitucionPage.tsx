import styles from './ConsultarInstitucionPage.module.css';
import { useState, useEffect } from 'react';
import { BackButton } from '../../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import ovoLogo from '../../assets/ovoLogo.svg';
import { listInstitutions } from '../../services/institutions';

interface Institution {
  nombre: string;
  sede?: string;
  descripcion?: string;
  carreras?: number;
  ubicacion?: string;
  tipo?: string;
  logo?: string;
  raw?: unknown;
}

// The UI expects a simple shape; map backend response to this shape below.

export default function ConsultarInstitucionPage() {
  const [filtro, setFiltro] = useState('');
  const [instituciones, setInstituciones] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listInstitutions()
      .then(data => {
        if (!mounted) return;
        // The backend returns an array of institutions. Map to the UI-friendly shape.
        const items = Array.isArray(data)
          ? data.map((it: Record<string, unknown>, idx: number) => {
              const ubicObj = it['ubicacion'];
              let ubicacion = '';
              if (ubicObj && typeof ubicObj === 'object') {
                const loc = (ubicObj as Record<string, unknown>)['localidad'];
                const prov = (ubicObj as Record<string, unknown>)['provincia'];
                ubicacion = [loc, prov].filter(Boolean).join(', ');
              } else {
                ubicacion = String(ubicObj || '');
              }

              const tipoInstitucion =
                it['tipo'] ||
                (it['tipoInstitucion'] &&
                (it['tipoInstitucion'] as Record<string, unknown>)['nombre']
                  ? (it['tipoInstitucion'] as Record<string, unknown>)['nombre']
                  : '');

              return {
                nombre: String(
                  it['nombre'] ||
                    it['sigla'] ||
                    it['nombreInstitucion'] ||
                    `Institución ${idx}`
                ),
                sede: String(it['sigla'] || it['sede'] || it['nombre'] || ''),

                carreras: Number(it['cantidadCarreras'] || it['carreras'] || 0),
                ubicacion,
                tipo: String(tipoInstitucion || ''),
                logo: String(it['logo'] || ovoLogo),
                raw: it as Record<string, unknown>,
              } as Institution;
            })
          : [];

        setInstituciones(items);
      })
      .catch(err => {
        console.error('Error cargando instituciones:', err);
        setError('No se pudieron cargar las instituciones');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const institucionesFiltradas = instituciones.filter(
    inst =>
      inst.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      (inst.sede || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (inst.ubicacion || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (inst.tipo || '').toLowerCase().includes(filtro.toLowerCase())
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
        {loading ? (
          <div>Cargando instituciones...</div>
        ) : error ? (
          <div style={{ color: 'var(--color-accent-2)' }}>{error}</div>
        ) : institucionesFiltradas.length === 0 ? (
          <div>No se encontraron instituciones</div>
        ) : (
          institucionesFiltradas.map(inst => (
            <div
              key={
                inst.raw &&
                ((inst.raw as Record<string, unknown>)['idInstitucion'] ||
                  (inst.raw as Record<string, unknown>)['id'])
                  ? `${(inst.raw as Record<string, unknown>)['idInstitucion'] || (inst.raw as Record<string, unknown>)['id']}`
                  : inst.nombre
              }
              className={styles.card}
              onClick={() => {
                let id: string | number | undefined;
                if (inst.raw && typeof inst.raw === 'object') {
                  const r = inst.raw as Record<string, unknown>;
                  id = r['idInstitucion'] as string | number | undefined;
                  if (!id) id = r['id'] as string | number | undefined;
                }
                if (id) navigate(`/app/detalle-institucion/${id}`);
                else navigate('/app/detalle-institucion');
              }}
            >
              <div className={styles.cardHeader}>
                <img
                  src={inst.logo}
                  alt={inst.nombre}
                  className={styles.logo}
                />
                <div>
                  <h2 className={styles.cardTitle}>{inst.nombre}</h2>
                  <span className={styles.cardSede}>{inst.sede}</span>
                </div>
              </div>
              <p className={styles.descripcion}>
                {JSON.stringify((inst as Institution).descripcion)}
              </p>
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
          ))
        )}
      </div>
    </div>
  );
}
