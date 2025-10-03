export interface CareerDTO {
  id?: number | string;
  idCarrera?: number | string;
  careerId?: number | string;
  idModalidad?: number | string;
  idModalidadCarrera?: number | string;
  idEstado?: number | string;
  idEstadoCarreraInstitucion?: number | string;
  nombre?: string;
  nombreCarrera?: string;
  titulo?: string;
  tituloCarrera?: string;
  cantidadMaterias?: number | string;
  duracionCarrera?: number | string;
  horasCursado?: number | string;
  observaciones?: string;
  montoCuota?: number | string;
  fechaInicio?: string;
  fechaFin?: string;
  activo?: boolean;
}

export function getMyCareers(): Promise<CareerDTO[]>;
export function getMyCareer(id: number | string): Promise<CareerDTO>;
export function createMyCareer(payload: unknown): Promise<unknown>;
export function updateMyCareer(
  id: number | string,
  payload: unknown
): Promise<unknown>;
export function deleteMyCareer(id: number | string): Promise<unknown>;

export function getMyCareerFaqs(careerId: number | string): Promise<unknown[]>;
export function createMyCareerFaq(
  careerId: number | string,
  payload: unknown
): Promise<unknown>;
export function updateMyCareerFaq(
  careerId: number | string,
  faqId: number | string,
  payload: unknown
): Promise<unknown>;
export function deleteMyCareerFaq(
  careerId: number | string,
  faqId: number | string
): Promise<unknown>;

export function getMyCareerMaterials(
  careerId: number | string
): Promise<unknown[]>;
export function createMyCareerMaterial(
  careerId: number | string,
  payload: unknown
): Promise<unknown>;
export function updateMyCareerMaterial(
  careerId: number | string,
  materialId: number | string,
  payload: unknown
): Promise<unknown>;
export function deleteMyCareerMaterial(
  careerId: number | string,
  materialId: number | string
): Promise<unknown>;

export function getMyCareerAptitudes(
  careerId: number | string
): Promise<unknown[]>;
export function addMyCareerAptitude(
  careerId: number | string,
  payload: unknown
): Promise<unknown>;
export function removeMyCareerAptitude(
  careerId: number | string,
  aptitudeId: number | string
): Promise<unknown>;
export type RegistrationOptions = {
  tipoInstituciones?: Array<{ id: number | string; nombre: string }>;
  tipos?: Array<{ id: number | string; nombre: string }>;
  paises?: Array<{ id: number | string; nombre: string }>;
  countryList?: Array<{ id: number | string; nombre: string }>;
  provincias?: Array<{ id: number | string; nombre: string }>;
  provinceList?: Array<{ id: number | string; nombre: string }>;
  localidades?: Array<{ id: number | string; nombre: string }>;
  localityList?: Array<{ id: number | string; nombre: string }>;
};

export function registerInstitution(
  body: Record<string, unknown>
): Promise<Record<string, unknown>>;

// Catalog functions for institutions
export interface ModalityDTO {
  id: number | string;
  nombre: string;
}

export interface CareerStateDTO {
  id: number | string;
  nombre: string;
}

export function getCareerModalities(
  params?: Record<string, unknown>
): Promise<ModalityDTO[]>;
export function getCareerStates(
  params?: Record<string, unknown>
): Promise<CareerStateDTO[]>;

export {};
