import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from './InstitutionSignupPage.module.css';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { BackButton } from '../../components/ui/BackButton';
import { getCatalog } from '../../services/catalog';
import { registerInstitution } from '../../services/institutions.js';
import {
  listCountries,
  listProvinces,
  listLocalities,
} from '../../services/admin.js';
import { TermsContent } from '../legal/TerminosYCondicionesPage';
import { PrivacyContent } from '../legal/PoliticasDePrivacidadPage';
import { useToast } from '../../components/ui/toast/useToast';

type Option = { id: number | string; nombre: string };

export default function InstitutionSignupPage() {
  const [nombre, setNombre] = useState('');
  const [idTipoInstitucion, setIdTipoInstitucion] = useState<string | number>(
    ''
  );
  const [pais, setPais] = useState<string | number>('');
  const [provincia, setProvincia] = useState<string | number>('');
  const [localidad, setLocalidad] = useState<string | number>('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [siglaInstitucion, setSiglaInstitucion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');
  const [urlLogo, setUrlLogo] = useState('');
  const [anioFundacion, setAnioFundacion] = useState<string | number>('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [cuit, setCuit] = useState('');

  const [tipos, setTipos] = useState<Option[]>([]);
  const [paises, setPaises] = useState<Option[]>([]);
  const [provincias, setProvincias] = useState<Option[]>([]);
  const [localidades, setLocalidades] = useState<Option[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de carga para los selects en cascada
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [provincesError, setProvincesError] = useState<string | null>(null);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [localitiesError, setLocalitiesError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // modal: 0 closed, 1 terms, 2 privacy
  const [modalStage, setModalStage] = useState<number>(0);
  const legalScrollRef = useRef<HTMLDivElement | null>(null);

  // Cargar tipos de institución y países iniciales
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Cargar tipos de institución
        const instTypesResp = await getCatalog('institution-types', {
          includeInactive: 1,
        });

        // La respuesta puede tener la estructura { institutionTypes: [...] }
        let institutionTypesData: unknown[] = [];
        if (instTypesResp && typeof instTypesResp === 'object') {
          const resp = instTypesResp as Record<string, unknown>;
          if (
            'institutionTypes' in resp &&
            Array.isArray(resp.institutionTypes)
          ) {
            institutionTypesData = resp.institutionTypes;
          } else if ('data' in resp) {
            const data = resp.data as Record<string, unknown>;
            if (
              data &&
              'institutionTypes' in data &&
              Array.isArray(data.institutionTypes)
            ) {
              institutionTypesData = data.institutionTypes;
            } else if (Array.isArray(data)) {
              institutionTypesData = data;
            }
          } else if (Array.isArray(instTypesResp)) {
            institutionTypesData = instTypesResp;
          }
        }

        // Mapear los tipos de institución con la estructura correcta
        const mapInstitutionTypes = (v: unknown[]): Option[] => {
          if (!Array.isArray(v)) return [];
          return v
            .filter(it => it && typeof it === 'object')
            .map(it => it as Record<string, unknown>)
            .filter(it => !it.fechaFin) // Filtrar los que no tienen fechaFin (activos)
            .map(it => ({
              id: (it.idTipoInstitucion ?? it.id ?? '') as string | number,
              nombre: (it.nombreTipoInstitucion ??
                it.nombre ??
                String(it)) as string,
            }));
        };

        const mappedTypes = mapInstitutionTypes(institutionTypesData);

        if (active) setTipos(mappedTypes);

        // Cargar países
        setLoadingCountries(true);
        setCountriesError(null);
        try {
          const countries = await listCountries({ includeInactive: 1 });
          if (active) setPaises(countries.filter(c => c.activo !== false));
        } catch {
          if (active) setCountriesError('No se pudieron cargar los países');
        } finally {
          if (active) setLoadingCountries(false);
        }
      } catch (e) {
        if (active) {
          try {
            setError(typeof e === 'string' ? e : JSON.stringify(e));
          } catch {
            setError('Error al cargar opciones');
          }
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Provincias al cambiar país
  useEffect(() => {
    let active = true;
    (async () => {
      if (!pais) {
        setProvincias([]);
        setProvincia('');
        setLocalidades([]);
        setLocalidad('');
        return;
      }
      setLoadingProvinces(true);
      setProvincesError(null);
      try {
        const pr = await listProvinces({ idPais: pais, includeInactive: 1 });
        if (active) setProvincias(pr.filter(p => p.activo !== false));
      } catch {
        if (active) setProvincesError('No se pudieron cargar las provincias');
      } finally {
        if (active) setLoadingProvinces(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [pais]);

  // Localidades al cambiar provincia
  useEffect(() => {
    let active = true;
    (async () => {
      if (!provincia) {
        setLocalidades([]);
        setLocalidad('');
        return;
      }
      setLoadingLocalities(true);
      setLocalitiesError(null);
      try {
        const locs = await listLocalities({
          idProvincia: provincia,
          includeInactive: 1,
        });
        // Filtrar por provincia para asegurar consistencia
        const filtered = (locs || [])
          .filter(l => l.activo !== false)
          .filter(l => String(l.idProvincia) === String(provincia));
        if (active) {
          setLocalidades(filtered);
          // Si la localidad seleccionada ya no pertenece a la provincia elegida, la limpiamos
          if (
            localidad &&
            !filtered.some(l => String(l.id) === String(localidad))
          ) {
            setLocalidad('');
          }
        }
      } catch {
        if (active) setLocalitiesError('No se pudieron cargar las localidades');
      } finally {
        if (active) setLoadingLocalities(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [provincia, localidad]);

  const submit = () => {
    // Validación completa de todos los campos obligatorios
    if (!nombre.trim()) {
      setError('El nombre de la institución es obligatorio');
      return;
    }
    if (!idTipoInstitucion) {
      setError('Debe seleccionar un tipo de institución');
      return;
    }
    if (!pais) {
      setError('Debe seleccionar un país');
      return;
    }
    if (!provincia) {
      setError('Debe seleccionar una provincia');
      return;
    }
    if (!localidad) {
      setError('Debe seleccionar una localidad');
      return;
    }
    if (!direccion.trim()) {
      setError('La dirección es obligatoria');
      return;
    }
    if (!email.trim()) {
      setError('El email de contacto es obligatorio');
      return;
    }
    if (!siglaInstitucion.trim()) {
      setError('La sigla de la institución es obligatoria');
      return;
    }
    if (!telefono.trim()) {
      setError('El teléfono es obligatorio');
      return;
    }
    if (!sitioWeb.trim()) {
      setError('El sitio web es obligatorio');
      return;
    }
    if (!anioFundacion) {
      setError('El año de fundación es obligatorio');
      return;
    }
    if (!codigoPostal.trim()) {
      setError('El código postal es obligatorio');
      return;
    }
    if (!cuit.trim()) {
      setError('El CUIT es obligatorio');
      return;
    }

    // Limpiar error y mostrar modal
    setError(null);
    setModalStage(1);
  };
  const performRegister = async (accepted = false) => {
    setError(null);
    setLoading(true);
    try {
      const body = {
        nombreInstitucion: nombre,
        idTipoInstitucion: idTipoInstitucion || null,
        paisId: pais || null,
        provinciaId: provincia || null,
        localidadId: localidad || null,
        direccion: direccion || null,
        email: email || null,
        siglaInstitucion: siglaInstitucion || null,
        telefono: telefono || null,
        sitioWeb: sitioWeb || null,
        urlLogo: urlLogo || null,
        anioFundacion: anioFundacion || null,
        codigoPostal: codigoPostal || null,
        CUIT: cuit || null,
        aceptaPoliticas: accepted,
      } as const;
      await registerInstitution(body);
      setModalStage(0);

      // Mostrar mensaje de confirmación con toast
      showToast(
        'Solicitud enviada exitosamente. Un administrador revisará su solicitud y le llegará la respuesta a su email de contacto. Gracias por su interés en registrar su institución.',
        { variant: 'success', ttl: 8000 }
      );

      // Redirigir al home del sistema
      navigate('/');
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
              required
            />
          </div>

          <div className={styles.field}>
            <label>Tipo de Institución *</label>
            <select
              value={String(idTipoInstitucion)}
              onChange={e => setIdTipoInstitucion(e.target.value)}
              className={styles.select}
              required
            >
              <option value=''>Seleccione un tipo</option>
              {tipos.map((t: Option) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row} style={{ marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label>País *</label>
              <select
                value={String(pais)}
                onChange={e => {
                  setPais(e.target.value);
                  setProvincia('');
                  setLocalidad('');
                }}
                className={styles.select}
                disabled={loadingCountries || !!countriesError}
                required
              >
                <option value=''>Seleccione un país</option>
                {paises.map((p: Option) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {loadingCountries && (
                <div
                  style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
                >
                  Cargando países...
                </div>
              )}
              {countriesError && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#e74c3c',
                    marginTop: '4px',
                  }}
                >
                  {countriesError}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label>Provincia *</label>
              <select
                value={String(provincia)}
                onChange={e => {
                  setProvincia(e.target.value);
                  setLocalidad('');
                }}
                className={styles.select}
                disabled={!pais || loadingProvinces || !!provincesError}
                required
              >
                <option value=''>Seleccione una provincia</option>
                {provincias.map((p: Option) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {loadingProvinces && (
                <div
                  style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
                >
                  Cargando provincias...
                </div>
              )}
              {provincesError && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#e74c3c',
                    marginTop: '4px',
                  }}
                >
                  {provincesError}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label>Localidad *</label>
              <select
                value={String(localidad)}
                onChange={e => setLocalidad(e.target.value)}
                className={styles.select}
                disabled={!provincia || loadingLocalities || !!localitiesError}
                required
              >
                <option value=''>Seleccione una localidad</option>
                {localidades.map((l: Option) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </select>
              {loadingLocalities && (
                <div
                  style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
                >
                  Cargando localidades...
                </div>
              )}
              {localitiesError && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#e74c3c',
                    marginTop: '4px',
                  }}
                >
                  {localitiesError}
                </div>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <Input
              label='Dirección *'
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              fullWidth
              required
            />
          </div>

          <div className={styles.row} style={{ marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <Input
                label='Código Postal *'
                value={codigoPostal}
                onChange={e => setCodigoPostal(e.target.value)}
                fullWidth
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label='CUIT *'
                value={cuit}
                onChange={e => setCuit(e.target.value)}
                fullWidth
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <Input
              label='Email de Contacto'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              required
            />
          </div>

          <div className={styles.row} style={{ marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <Input
                label='Sigla Institución *'
                value={siglaInstitucion}
                onChange={e => setSiglaInstitucion(e.target.value)}
                fullWidth
                required
                placeholder='Ej: UTN, UBA'
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label='Teléfono *'
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                fullWidth
                required
                placeholder='Ej: +54 11 1234-5678'
              />
            </div>
          </div>

          <div className={styles.row} style={{ marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <Input
                label='Sitio Web *'
                value={sitioWeb}
                onChange={e => setSitioWeb(e.target.value)}
                fullWidth
                required
                placeholder='Ej: https://www.institucion.edu.ar'
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label='Año de Fundación *'
                type='number'
                value={anioFundacion}
                onChange={e => setAnioFundacion(e.target.value)}
                fullWidth
                required
                placeholder='Ej: 1952'
                min='1800'
                max='2025'
              />
            </div>
          </div>

          <div className={styles.field}>
            <Input
              label='URL del Logo (opcional)'
              value={urlLogo}
              onChange={e => setUrlLogo(e.target.value)}
              fullWidth
              placeholder='Ej: https://www.institucion.edu.ar/logo.png'
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
          {/* Two-step modal: stage 1 = Terms, stage 2 = Privacy */}
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
                    onClick={() => {
                      setModalStage(0);
                    }}
                  >
                    Cancelar
                  </button>
                  {modalStage === 1 ? (
                    <button
                      className={styles.btnPrimary}
                      onClick={() => {
                        // avanzar a políticas
                        setModalStage(2);
                      }}
                    >
                      Aceptar y ver Políticas
                    </button>
                  ) : (
                    <button
                      className={styles.btnPrimary}
                      onClick={() => {
                        performRegister(true);
                      }}
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
