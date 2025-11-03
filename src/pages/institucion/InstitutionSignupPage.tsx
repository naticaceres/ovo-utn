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
import { getApiErrorMessage } from '../../context/api';

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

  // Estados para errores por campo
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
      // Cargar tipos de institución - manejo de errores sin bloquear el formulario
      try {
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
      } catch (e) {
        // Si falla la carga de tipos, no bloqueamos el formulario
        // Solo mostramos un mensaje en consola
        console.warn('No se pudieron cargar los tipos de institución:', e);
        if (active) {
          // Establecer tipos por defecto si el endpoint falla
          setTipos([
            { id: 1, nombre: 'Universidad' },
            { id: 2, nombre: 'Instituto Terciario' },
            { id: 3, nombre: 'Instituto Técnico' },
            { id: 4, nombre: 'Centro de Formación' },
          ]);
        }
      }

      // Cargar países
      setLoadingCountries(true);
      setCountriesError(null);
      try {
        const countries = await listCountries({ includeInactive: 1 });
        if (active) setPaises(countries.filter(c => c.activo !== false));
      } catch (err: unknown) {
        if (active) setCountriesError(getApiErrorMessage(err));
      } finally {
        if (active) setLoadingCountries(false);
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
      } catch (err: unknown) {
        if (active) setProvincesError(getApiErrorMessage(err));
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
      } catch (err: unknown) {
        if (active) setLocalitiesError(getApiErrorMessage(err));
      } finally {
        if (active) setLoadingLocalities(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [provincia, localidad]);

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Limpiar errores previos
    setError(null);
    const errors: Record<string, string> = {};

    // Validación completa de todos los campos obligatorios
    if (!nombre.trim()) {
      errors.nombre = 'Completa este campo';
    }
    if (!idTipoInstitucion) {
      errors.idTipoInstitucion = 'Completa este campo';
    }
    if (!pais) {
      errors.pais = 'Completa este campo';
    }
    if (!provincia) {
      errors.provincia = 'Completa este campo';
    }
    if (!localidad) {
      errors.localidad = 'Completa este campo';
    }
    if (!direccion.trim()) {
      errors.direccion = 'Completa este campo';
    }

    // Validación de email
    if (!email.trim()) {
      errors.email = 'Completa este campo';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Ingresa un email válido (debe contener @ y un dominio)';
    }

    if (!siglaInstitucion.trim()) {
      errors.siglaInstitucion = 'Completa este campo';
    }

    // Validación de teléfono
    if (!telefono.trim()) {
      errors.telefono = 'Completa este campo';
    } else if (!/^[\d\s+\-()]+$/.test(telefono)) {
      errors.telefono =
        'El teléfono solo debe contener números y símbolos válidos (+, -, paréntesis)';
    }

    // Validación de sitio web
    if (!sitioWeb.trim()) {
      errors.sitioWeb = 'Completa este campo';
    } else if (!/^https?:\/\/.+\..+/.test(sitioWeb)) {
      errors.sitioWeb = 'Ingresa una URL válida (ej: https://www.ejemplo.com)';
    }

    // Validación de año de fundación
    if (!anioFundacion) {
      errors.anioFundacion = 'Completa este campo';
    } else {
      const year = Number(anioFundacion);
      if (year < 1800 || year > 2025) {
        errors.anioFundacion = 'El año debe estar entre 1800 y 2025';
      }
    }

    if (!codigoPostal.trim()) {
      errors.codigoPostal = 'Completa este campo';
    }

    // Validación de CUIT
    if (!cuit.trim()) {
      errors.cuit = 'Completa este campo';
    } else if (!/^\d{2}-?\d{8}-?\d{1}$/.test(cuit.replace(/\s/g, ''))) {
      errors.cuit = 'El CUIT debe tener formato XX-XXXXXXXX-X o 11 dígitos';
    }

    // Validación de URL del logo
    if (!urlLogo.trim()) {
      errors.urlLogo = 'Completa este campo';
    } else if (!/^https?:\/\/.+\..+/.test(urlLogo)) {
      errors.urlLogo =
        'Ingresa una URL válida (ej: https://www.ejemplo.com/logo.png)';
    }

    // Si hay errores, actualizar estado y no continuar
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor, completa todos los campos correctamente');
      return;
    }

    // Limpiar errores y mostrar modal
    setFieldErrors({});
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
    } catch (err: unknown) {
      setModalStage(0);
      setError(getApiErrorMessage(err));
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

          <form onSubmit={submit}>
            <div className={styles.field}>
              <Input
                label='Nombre de la Institución *'
                value={nombre}
                onChange={e => {
                  setNombre(e.target.value);
                  if (fieldErrors.nombre) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.nombre;
                      return newErrors;
                    });
                  }
                }}
                fullWidth
                required
                error={fieldErrors.nombre}
                placeholder='Nombre completo de la institución'
              />
            </div>

            <div className={styles.field}>
              <label>Tipo de Institución *</label>
              <select
                value={String(idTipoInstitucion)}
                onChange={e => {
                  setIdTipoInstitucion(e.target.value);
                  if (fieldErrors.idTipoInstitucion) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.idTipoInstitucion;
                      return newErrors;
                    });
                  }
                }}
                className={`${styles.select} ${fieldErrors.idTipoInstitucion ? styles.selectError : ''}`}
                required
              >
                <option value=''>Seleccione un tipo</option>
                {tipos.map((t: Option) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
              {fieldErrors.idTipoInstitucion && (
                <div className={styles.fieldError}>
                  <span>⚠️</span> {fieldErrors.idTipoInstitucion}
                </div>
              )}
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
                    if (fieldErrors.pais) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.pais;
                        return newErrors;
                      });
                    }
                  }}
                  className={`${styles.select} ${fieldErrors.pais ? styles.selectError : ''}`}
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
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px',
                    }}
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
                {fieldErrors.pais && (
                  <div className={styles.fieldError}>
                    <span>⚠️</span> {fieldErrors.pais}
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
                    if (fieldErrors.provincia) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.provincia;
                        return newErrors;
                      });
                    }
                  }}
                  className={`${styles.select} ${fieldErrors.provincia ? styles.selectError : ''}`}
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
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px',
                    }}
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
                {fieldErrors.provincia && (
                  <div className={styles.fieldError}>
                    <span>⚠️</span> {fieldErrors.provincia}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label>Localidad *</label>
                <select
                  value={String(localidad)}
                  onChange={e => {
                    setLocalidad(e.target.value);
                    if (fieldErrors.localidad) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.localidad;
                        return newErrors;
                      });
                    }
                  }}
                  className={`${styles.select} ${fieldErrors.localidad ? styles.selectError : ''}`}
                  disabled={
                    !provincia || loadingLocalities || !!localitiesError
                  }
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
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px',
                    }}
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
                {fieldErrors.localidad && (
                  <div className={styles.fieldError}>
                    <span>⚠️</span> {fieldErrors.localidad}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <Input
                label='Dirección *'
                value={direccion}
                onChange={e => {
                  setDireccion(e.target.value);
                  if (fieldErrors.direccion) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.direccion;
                      return newErrors;
                    });
                  }
                }}
                fullWidth
                required
                error={fieldErrors.direccion}
                placeholder='Calle, número, piso, depto.'
              />
            </div>

            <div className={styles.row} style={{ marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <Input
                  label='Código Postal *'
                  value={codigoPostal}
                  onChange={e => {
                    // Permitir solo números
                    const value = e.target.value.replace(/\D/g, '');
                    setCodigoPostal(value);
                    if (fieldErrors.codigoPostal) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.codigoPostal;
                        return newErrors;
                      });
                    }
                  }}
                  fullWidth
                  required
                  error={fieldErrors.codigoPostal}
                  placeholder='Ej: 1234'
                  maxLength={8}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label='CUIT *'
                  value={cuit}
                  onChange={e => {
                    // Permitir solo números y guiones
                    const value = e.target.value.replace(/[^\d-]/g, '');
                    setCuit(value);
                    if (fieldErrors.cuit) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.cuit;
                        return newErrors;
                      });
                    }
                  }}
                  fullWidth
                  required
                  error={fieldErrors.cuit}
                  placeholder='XX-XXXXXXXX-X'
                  maxLength={13}
                />
              </div>
            </div>

            <div className={styles.field}>
              <Input
                label='Email de Contacto *'
                type='email'
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.email;
                      return newErrors;
                    });
                  }
                }}
                fullWidth
                required
                error={fieldErrors.email}
                placeholder='correo@institucion.edu.ar'
              />
            </div>

            <div className={styles.row} style={{ marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <Input
                  label='Sigla Institución *'
                  value={siglaInstitucion}
                  onChange={e => {
                    // Convertir a mayúsculas automáticamente
                    const value = e.target.value.toUpperCase();
                    setSiglaInstitucion(value);
                    if (fieldErrors.siglaInstitucion) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.siglaInstitucion;
                        return newErrors;
                      });
                    }
                  }}
                  fullWidth
                  required
                  error={fieldErrors.siglaInstitucion}
                  placeholder='UTN, UBA, etc.'
                  maxLength={10}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label='Teléfono *'
                  type='tel'
                  value={telefono}
                  onChange={e => {
                    // Permitir solo números, espacios, +, -, y paréntesis
                    const value = e.target.value.replace(/[^\d\s+\-()]/g, '');
                    setTelefono(value);
                    if (fieldErrors.telefono) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.telefono;
                        return newErrors;
                      });
                    }
                  }}
                  fullWidth
                  required
                  placeholder='+54 11 1234-5678'
                  error={fieldErrors.telefono}
                />
              </div>
            </div>

            <div className={styles.row} style={{ marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <Input
                  label='Sitio Web *'
                  type='url'
                  value={sitioWeb}
                  onChange={e => {
                    setSitioWeb(e.target.value);
                    if (fieldErrors.sitioWeb) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.sitioWeb;
                        return newErrors;
                      });
                    }
                  }}
                  fullWidth
                  required
                  placeholder='https://www.institucion.edu.ar'
                  error={fieldErrors.sitioWeb}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label='Año de Fundación *'
                  type='number'
                  value={anioFundacion}
                  onChange={e => {
                    const value = e.target.value;
                    // Validar que esté en el rango correcto
                    if (
                      value === '' ||
                      (Number(value) >= 1800 && Number(value) <= 2025)
                    ) {
                      setAnioFundacion(value);
                    }
                    if (fieldErrors.anioFundacion) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.anioFundacion;
                        return newErrors;
                      });
                    }
                  }}
                  fullWidth
                  required
                  placeholder='1952'
                  min='1800'
                  max='2025'
                  error={fieldErrors.anioFundacion}
                />
              </div>
            </div>

            <div className={styles.field}>
              <Input
                label='URL del Logo *'
                type='url'
                value={urlLogo}
                onChange={e => {
                  setUrlLogo(e.target.value);
                  if (fieldErrors.urlLogo) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.urlLogo;
                      return newErrors;
                    });
                  }
                }}
                fullWidth
                required
                placeholder='https://www.institucion.edu.ar/logo.png'
                error={fieldErrors.urlLogo}
              />
            </div>

            <div className={styles.actions}>
              <Button
                variant='outline'
                type='button'
                onClick={() => navigate('/app/signup')}
              >
                Cancelar
              </Button>
              <Button type='submit' isLoading={loading}>
                Enviar Solicitud
              </Button>
            </div>
          </form>
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
