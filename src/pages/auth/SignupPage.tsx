import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerService } from '../../services/auth.js';
import {
  listGenders,
  listLocalities,
  listCountries,
  listProvinces,
} from '../../services/admin.js';
import { TermsContent } from '../legal/TerminosYCondicionesPage';
import { PrivacyContent } from '../legal/PoliticasDePrivacidadPage';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from './SignupPage.module.css';
import { getApiErrorMessage } from '../../context/api';

export function SignupPage() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [dni, setDni] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [idGenero, setIdGenero] = useState('');
  const [genders, setGenders] = useState<
    Array<{ id: string | number; nombre: string }>
  >([]);
  const [loadingGenders, setLoadingGenders] = useState(false);
  const [gendersError, setGendersError] = useState<string | null>(null);
  const [idLocalidad, setIdLocalidad] = useState('');
  const [idPais, setIdPais] = useState('');
  const [idProvincia, setIdProvincia] = useState('');
  const [countries, setCountries] = useState<
    Array<{ id: string | number; nombre: string }>
  >([]);
  const [provinces, setProvinces] = useState<
    Array<{
      id: string | number;
      nombre: string;
      idPais?: string | number | null;
    }>
  >([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [provincesError, setProvincesError] = useState<string | null>(null);
  const [localities, setLocalities] = useState<
    Array<{
      id: string | number;
      nombre: string;
      idProvincia?: string | number | null;
    }>
  >([]);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [localitiesError, setLocalitiesError] = useState<string | null>(null);
  // modalStage: 0 = closed, 1 = show Terms, 2 = show Privacy
  const [modalStage, setModalStage] = useState<number>(0);
  const legalScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (modalStage === 2 && legalScrollRef.current) {
      legalScrollRef.current.scrollTop = 0;
    }
  }, [modalStage]);

  // Cargar países y géneros iniciales
  useEffect(() => {
    let active = true;
    (async () => {
      // Countries
      setLoadingCountries(true);
      setCountriesError(null);
      try {
        const cs = await listCountries({ includeInactive: 1 });
        if (active) setCountries(cs.filter(c => c.activo !== false));
      } catch {
        if (active) setCountriesError('No se pudieron cargar los países');
      } finally {
        if (active) setLoadingCountries(false);
      }
      setLoadingGenders(true);
      setGendersError(null);
      try {
        const data = await listGenders({ includeInactive: 1 });
        if (active) setGenders(data.filter(g => g.activo !== false));
      } catch {
        if (active) setGendersError('No se pudieron cargar los géneros');
      } finally {
        if (active) setLoadingGenders(false);
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
      if (!idPais) {
        setProvinces([]);
        setIdProvincia('');
        setLocalities([]);
        setIdLocalidad('');
        return;
      }
      setLoadingProvinces(true);
      setProvincesError(null);
      try {
        const pr = await listProvinces({ idPais, includeInactive: 1 });
        if (active) setProvinces(pr.filter(p => p.activo !== false));
      } catch {
        if (active) setProvincesError('No se pudieron cargar las provincias');
      } finally {
        if (active) setLoadingProvinces(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [idPais]);

  // Localidades al cambiar provincia (aplicando filtro defensivo por idProvincia)
  useEffect(() => {
    let active = true;
    (async () => {
      if (!idProvincia) {
        setLocalities([]);
        setIdLocalidad('');
        return;
      }
      setLoadingLocalities(true);
      setLocalitiesError(null);
      try {
        const locs = await listLocalities({ idProvincia, includeInactive: 1 });
        // Algunos backends podrían ignorar el parámetro y devolver TODAS las localidades.
        // Filtramos en memoria para asegurar consistencia UI.
        const filtered = (locs || [])
          .filter(l => l.activo !== false)
          .filter(l => String(l.idProvincia) === String(idProvincia));
        if (active) {
          setLocalities(filtered);
          // Si la localidad seleccionada ya no pertenece a la provincia elegida, la limpiamos.
          if (
            idLocalidad &&
            !filtered.some(l => String(l.id) === String(idLocalidad))
          ) {
            setIdLocalidad('');
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
  }, [idProvincia, idLocalidad]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    // Validar campos obligatorios
    if (
      !nombre ||
      !apellido ||
      !correo ||
      !dni ||
      !contrasena ||
      !fechaNac ||
      !idGenero ||
      !idLocalidad
    ) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setModalStage(1);
  };

  // Se reemplaza la función local por el helper global getApiErrorMessage

  const performRegister = async (accepted = false) => {
    setIsLoading(true);
    try {
      const payload = {
        correo,
        dni,
        nombre,
        apellido,
        contrasena,
        fechaNac,
        idGenero,
        idLocalidad,
        aceptaPoliticas: accepted,
      };
      await registerService(payload);
      setModalStage(0);
      navigate('/app/login');
    } catch (err: unknown) {
      setModalStage(0);
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.signupContainer}>
        <div className={styles.signupCard}>
          <h1 className={styles.title}>Crear cuenta</h1>
          <p className={styles.subtitle}>
            Únete a OVO y descubre tu vocación profesional
          </p>

          <form onSubmit={onSubmit} className={styles.form}>
            <Input
              label='Correo electrónico'
              type='email'
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              placeholder='tu@email.com'
              required
              fullWidth
            />
            <Input
              label='DNI'
              value={dni}
              onChange={e => setDni(e.target.value)}
              placeholder='Ingresa tu DNI'
              required
              fullWidth
            />
            <Input
              label='Nombre'
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder='Ingresa tu nombre'
              required
              fullWidth
            />
            <Input
              label='Apellido'
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              placeholder='Ingresa tu apellido'
              required
              fullWidth
            />
            <Input
              label='Fecha de nacimiento'
              type='date'
              value={fechaNac}
              onChange={e => setFechaNac(e.target.value)}
              required
              fullWidth
            />
            <div>
              <label className={styles.selectLabel}>Género</label>
              <select
                className={styles.select}
                value={idGenero}
                onChange={e => setIdGenero(e.target.value)}
                required
                disabled={loadingGenders || !!gendersError}
              >
                <option value=''>Selecciona un género</option>
                {genders.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
              </select>
              {loadingGenders && (
                <div className={styles.helperText}>Cargando géneros...</div>
              )}
              {gendersError && (
                <div className={styles.errorMessageSmall}>{gendersError}</div>
              )}
            </div>
            <div>
              <label className={styles.selectLabel}>País</label>
              <select
                className={styles.select}
                value={idPais}
                onChange={e => {
                  setIdPais(e.target.value);
                  setIdProvincia('');
                  setIdLocalidad('');
                }}
                required
                disabled={loadingCountries || !!countriesError}
              >
                <option value=''>Selecciona un país</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {loadingCountries && (
                <div className={styles.helperText}>Cargando países...</div>
              )}
              {countriesError && (
                <div className={styles.errorMessageSmall}>{countriesError}</div>
              )}
            </div>
            <div>
              <label className={styles.selectLabel}>Provincia</label>
              <select
                className={styles.select}
                value={idProvincia}
                onChange={e => {
                  setIdProvincia(e.target.value);
                  setIdLocalidad('');
                }}
                required
                disabled={!idPais || loadingProvinces || !!provincesError}
              >
                <option value=''>Selecciona una provincia</option>
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {loadingProvinces && (
                <div className={styles.helperText}>Cargando provincias...</div>
              )}
              {provincesError && (
                <div className={styles.errorMessageSmall}>{provincesError}</div>
              )}
            </div>
            <div>
              <label className={styles.selectLabel}>Localidad</label>
              <select
                className={styles.select}
                value={idLocalidad}
                onChange={e => setIdLocalidad(e.target.value)}
                required
                disabled={
                  !idProvincia || loadingLocalities || !!localitiesError
                }
              >
                <option value=''>Selecciona una localidad</option>
                {localities.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </select>
              {loadingLocalities && (
                <div className={styles.helperText}>Cargando localidades...</div>
              )}
              {localitiesError && (
                <div className={styles.errorMessageSmall}>
                  {localitiesError}
                </div>
              )}
            </div>
            <Input
              label='Contraseña'
              type='password'
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              placeholder='Mínimo 8 caracteres'
              required
              fullWidth
            />

            {error && (
              <div className={styles.errorMessage} role='alert'>
                {error}
              </div>
            )}

            <div className={styles.termsNote}>
              Al registrarte se te pedirá aceptar los Términos y las Políticas
              de Privacidad.
            </div>

            <Button
              type='submit'
              variant='primary'
              size='lg'
              fullWidth
              isLoading={isLoading}
            >
              Crear cuenta
            </Button>
            <div className={styles.loginLink}>
              ¿Ya tienes cuenta?{' '}
              <a href='/app/login' className={styles.link}>
                Inicia sesión
              </a>
            </div>
          </form>

          <div style={{ marginTop: 12 }}>
            <Button
              variant='outline'
              fullWidth
              onClick={() => navigate('/institution-signup')}
            >
              Registrar institución
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
                      disabled={isLoading}
                    >
                      Aceptar y registrar
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
