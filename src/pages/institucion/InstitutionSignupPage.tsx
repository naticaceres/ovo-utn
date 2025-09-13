import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from './InstitutionSignupPage.module.css';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { BackButton } from '../../components/ui/BackButton';
import { getCatalog } from '../../services/catalog';
import { registerInstitution } from '../../services/institutions.js';
import { TermsContent } from '../legal/TerminosYCondicionesPage';
import { PrivacyContent } from '../legal/PoliticasDePrivacidadPage';

type Option = { id: number | string; nombre: string };

export default function InstitutionSignupPage() {
  const [nombre, setNombre] = useState('');
  const [idTipoInstitucion, setIdTipoInstitucion] = useState<string | number>(
    ''
  );
  const [pais, setPais] = useState<string | number>('');
  const [provincia, setProvincia] = useState<string | number>('');
  const [localidad, setLocalidad] = useState<string | number>('');
  const [cuit, setCuit] = useState('');
  const [correoContacto, setCorreoContacto] = useState('');

  const [tipos, setTipos] = useState<Option[]>([]);
  const [paises, setPaises] = useState<Option[]>([]);
  const [provincias, setProvincias] = useState<Option[]>([]);
  const [localidades, setLocalidades] = useState<Option[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // modal: 0 closed, 1 terms, 2 privacy
  const [modalStage, setModalStage] = useState<number>(0);
  const legalScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        type RawItem = {
          id?: number | string;
          value?: number | string;
          nombre?: string;
          label?: string;
        };
        const mapList = (v: unknown): Option[] => {
          if (!Array.isArray(v)) return [];
          return (v as RawItem[]).map(it => ({
            id: it.id ?? it.value ?? '',
            nombre: it.nombre ?? it.label ?? String(it),
          }));
        };

        const [instTypesResp, countriesResp, provincesResp, localitiesResp] =
          await Promise.all([
            getCatalog('institution-types', { includeInactive: 1 }),
            getCatalog('countries', { includeInactive: 1 }),
            getCatalog('provinces', { includeInactive: 1 }),
            getCatalog('localities', { includeInactive: 1 }),
          ]);

        type AnyData = unknown;
        const instTypesData =
          (instTypesResp as AnyData as { data?: unknown })?.data ??
          (instTypesResp as AnyData) ??
          [];
        const countriesData =
          (countriesResp as AnyData as { data?: unknown })?.data ??
          (countriesResp as AnyData) ??
          [];
        const provincesData =
          (provincesResp as AnyData as { data?: unknown })?.data ??
          (provincesResp as AnyData) ??
          [];
        const localitiesData =
          (localitiesResp as AnyData as { data?: unknown })?.data ??
          (localitiesResp as AnyData) ??
          [];

        setTipos(mapList(instTypesData));
        setPaises(mapList(countriesData));
        setProvincias(mapList(provincesData));
        setLocalidades(mapList(localitiesData));
      } catch (e) {
        try {
          setError(typeof e === 'string' ? e : JSON.stringify(e));
        } catch {
          setError('Error al cargar opciones');
        }
      }
    })();
  }, []);

  const submit = () => {
    // start legal modal flow
    setModalStage(1);
  };

  const performRegister = async (accepted = false) => {
    setError(null);
    setLoading(true);
    try {
      const body = {
        nombreInstitucion: nombre,
        idTipoInstitucion: idTipoInstitucion || null,
        idPais: pais || null,
        idProvincia: provincia || null,
        idLocalidad: localidad || null,
        cuit: cuit || null,
        correoContacto: correoContacto || null,
        aceptaPoliticas: accepted,
      } as const;
      await registerInstitution(body);
      setModalStage(0);
      navigate('/app/signup');
    } catch (err) {
      const e = err as { message?: unknown } | undefined;
      setError(
        e && typeof e.message === 'string' ? e.message : 'Error al registrar'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.container}>
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BackButton />
            <h2 className={styles.title} style={{ margin: 0 }}>
              Registrar Institución
            </h2>
          </div>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <Input
              label='Nombre de la Institución'
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              fullWidth
            />
          </div>

          <div className={styles.field}>
            <label>Tipo de Institución</label>
            <select
              value={String(idTipoInstitucion)}
              onChange={e => setIdTipoInstitucion(e.target.value)}
              className={styles.select}
            >
              <option value=''>Seleccione</option>
              {tipos.map((t: Option) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row} style={{ marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label>País</label>
              <select
                value={String(pais)}
                onChange={e => setPais(e.target.value)}
                className={styles.select}
              >
                <option value=''>Seleccione</option>
                {paises.map((p: Option) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Provincia</label>
              <select
                value={String(provincia)}
                onChange={e => setProvincia(e.target.value)}
                className={styles.select}
              >
                <option value=''>Seleccione</option>
                {provincias.map((p: Option) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Localidad</label>
              <select
                value={String(localidad)}
                onChange={e => setLocalidad(e.target.value)}
                className={styles.select}
              >
                <option value=''>Seleccione</option>
                {localidades.map((l: Option) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <Input
              label='CUIT / Identificación legal'
              value={cuit}
              onChange={e => setCuit(e.target.value)}
              fullWidth
            />
          </div>

          <div className={styles.field}>
            <Input
              label='Correo de Contacto'
              type='email'
              value={correoContacto}
              onChange={e => setCorreoContacto(e.target.value)}
              fullWidth
            />
          </div>

          <div className={styles.actions}>
            <Button variant='outline' onClick={() => navigate('/app/signup')}>
              Cancelar
            </Button>
            <Button onClick={submit} isLoading={loading}>
              Enviar Solicitud
            </Button>
          </div>
          {/* Legal modal (Terms -> Privacy) */}
          {modalStage > 0 && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal} role='dialog' aria-modal='true'>
                <h2>
                  {modalStage === 1
                    ? 'Términos y Condiciones'
                    : 'Políticas de Privacidad'}
                </h2>
                <div className={styles.modalContent}>
                  <div className={styles.modalHalf}>
                    {modalStage === 1 ? (
                      <div className={styles.legalScroll}>
                        <TermsContent />
                      </div>
                    ) : (
                      <div className={styles.legalScroll} ref={legalScrollRef}>
                        <PrivacyContent />
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button
                    className={styles.btnSecondary}
                    onClick={() => setModalStage(0)}
                  >
                    Cancelar
                  </button>
                  {modalStage === 1 ? (
                    <button
                      className={styles.btnPrimary}
                      onClick={() => setModalStage(2)}
                    >
                      Aceptar y ver Políticas
                    </button>
                  ) : (
                    <button
                      className={styles.btnPrimary}
                      onClick={() => performRegister(true)}
                      disabled={loading}
                    >
                      Aceptar y enviar solicitud
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
