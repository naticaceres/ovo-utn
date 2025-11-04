export interface CareerTypeDTO {
  id: number | string;
  nombre: string;
  activo?: boolean;
  fechaFin?: string | null;
}

export function listCareerTypes(): Promise<CareerTypeDTO[]>;
export function createCareerType(body: {
  nombreTipoCarrera: string;
}): Promise<boolean>;
export function updateCareerType(
  id: number | string,
  body: { nombreTipoCarrera: string; fechaFin?: string | null }
): Promise<boolean>;
export function deactivateCareerType(id: number | string): Promise<boolean>;

// allow optional params/token when called from pages
export function listCareerTypes(
  params?: Record<string, unknown>,
  token?: string
): Promise<CareerTypeDTO[]>;

export interface ModalityDTO {
  id: number | string;
  nombre: string;
  activo?: boolean;
}

export function listModalities(
  params?: Record<string, unknown>,
  token?: string
): Promise<ModalityDTO[]>;
export function createModality(body: { nombre: string }): Promise<boolean>;
export function updateModality(
  id: number | string,
  body: { nombre: string }
): Promise<boolean>;
export function deactivateModality(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

export interface CareerStateDTO {
  id: number | string;
  nombre: string;
  activo?: boolean;
  fechaFin?: string | null;
}

export function listCareerStates(
  params?: Record<string, unknown>,
  token?: string
): Promise<CareerStateDTO[]>;
export function createCareerState(body: { nombre: string }): Promise<boolean>;
export function updateCareerState(
  id: number | string,
  body: { nombre: string; fechaFin?: string | null }
): Promise<boolean>;
export function deactivateCareerState(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

// Careers base ABM
export interface CareerBaseDTO {
  id: number | string;
  nombre: string;
  activo?: boolean;
  idTipoCarrera?: number | string | null;
  fechaFin?: string | null;
}

export function listCareersBase(
  params?: Record<string, unknown>,
  token?: string
): Promise<CareerBaseDTO[]>;
export function createCareerBase(
  body: {
    nombre: string;
    idTipoCarrera?: number | string;
    fechaFin?: string | null;
  },
  token?: string
): Promise<boolean>;
export function updateCareerBase(
  id: number | string,
  body: {
    nombre: string;
    idTipoCarrera?: number | string;
    fechaFin?: string | null;
  },
  token?: string
): Promise<boolean>;
export function deactivateCareerBase(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

// Institution types
export interface InstitutionTypeDTO {
  id: number | string;
  nombre: string;
  activo?: boolean;
}
export function listInstitutionTypes(
  params?: Record<string, unknown>,
  token?: string
): Promise<InstitutionTypeDTO[]>;
export function createInstitutionType(body: {
  nombre: string;
}): Promise<boolean>;
export function updateInstitutionType(
  id: number | string,
  body: { nombre: string }
): Promise<boolean>;
export function deactivateInstitutionType(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

// Institution states
export interface InstitutionStateDTO {
  id: number | string;
  nombre: string;
  activo?: boolean;
}
export function listInstitutionStates(
  params?: Record<string, unknown>,
  token?: string
): Promise<InstitutionStateDTO[]>;
export function createInstitutionState(body: {
  nombre: string;
}): Promise<boolean>;
export function updateInstitutionState(
  id: number | string,
  body: { nombre: string }
): Promise<boolean>;
export function deactivateInstitutionState(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

// Countries (Países)
export interface CountryDTO {
  id: number | string;
  nombre: string;
  activo?: boolean;
}

export function listCountries(
  params?: Record<string, unknown>,
  token?: string
): Promise<CountryDTO[]>;

export function createCountry(body: { nombre: string }): Promise<boolean>;

export function updateCountry(
  id: number | string,
  body: { nombre: string }
): Promise<boolean>;

export function deactivateCountry(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

// Provinces (Provincias)
export interface ProvinceDTO {
  id: number | string;
  nombre: string;
  idPais?: number | string | null;
  activo?: boolean;
}

export function listProvinces(
  params?: Record<string, unknown>,
  token?: string
): Promise<ProvinceDTO[]>;

export function createProvince(
  body: {
    nombre: string;
    idPais?: number | string | null;
  },
  token?: string
): Promise<boolean>;

export function updateProvince(
  id: number | string,
  body: { nombre: string; idPais?: number | string | null },
  token?: string
): Promise<boolean>;

export function deactivateProvince(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

// Localities (Localidades)
export interface LocalityDTO {
  id: number | string;
  nombre: string;
  idProvincia?: number | string | null;
  activo?: boolean;
}

export function listLocalities(
  params?: Record<string, unknown>,
  token?: string
): Promise<LocalityDTO[]>;

export function createLocality(
  body: {
    nombre: string;
    idProvincia?: number | string | null;
  },
  token?: string
): Promise<boolean>;

export function updateLocality(
  id: number | string,
  body: { nombre: string; idProvincia?: number | string | null },
  token?: string
): Promise<boolean>;

export function deactivateLocality(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

// Genders (Géneros)
export interface GenderDTO {
  id: number | string;
  nombre: string;
  activo?: boolean;
}

export function listGenders(
  params?: Record<string, unknown>,
  token?: string
): Promise<GenderDTO[]>;

export function createGender(body: { nombre: string }): Promise<boolean>;

export function updateGender(
  id: number | string,
  body: { nombre: string }
): Promise<boolean>;

export function deactivateGender(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

export interface ActionTypeDTO {
  id: number | string;
  nombre: string;
  activo?: boolean;
}

export function listActionTypes(
  params?: Record<string, unknown>,
  token?: string
): Promise<ActionTypeDTO[]>;
export function createActionType(body: { nombre: string }): Promise<boolean>;
export function updateActionType(
  id: number | string,
  body: { nombre: string }
): Promise<boolean>;
export function deactivateActionType(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

// Institution requests
export function listInstitutionRequests(
  params?: Record<string, unknown>,
  token?: string
): Promise<unknown[]>;
export function approveInstitutionRequest(
  id: number | string,
  token?: string
): Promise<boolean>;
export function rejectInstitutionRequest(
  id: number | string,
  justificacion: string,
  token?: string
): Promise<boolean>;
export function deactivateInstitution(
  id: number | string,
  token?: string
): Promise<boolean>;
export function activateInstitution(
  id: number | string,
  token?: string
): Promise<boolean>;

export interface InstitutionStateHistoryDTO {
  idinstitucionEstado: number;
  nombreEstadoInstitucion: string;
  fechaInicio: string;
  fechaFin: string | null;
  justificacion: string | null;
}

export function getInstitutionStateHistory(
  institutionId: number | string,
  token?: string
): Promise<InstitutionStateHistoryDTO[]>;

export interface GroupDTO {
  id: number | string;
  nombre: string;
}

export function listGroups(
  params?: Record<string, unknown>,
  token?: string
): Promise<GroupDTO[]>;

export function userGroups(
  userId: number | string,
  token?: string
): Promise<GroupDTO[]>;

export interface UserStateDTO {
  id: number | string;
  nombre: string;
  activo?: boolean;
  fechaFin?: string | null;
}

export function listUserStates(
  params?: Record<string, unknown>,
  token?: string
): Promise<UserStateDTO[]>;

export function createUserState(body: {
  nombreEstadoUsuario: string;
}): Promise<boolean>;

export function updateUserState(
  id: number | string,
  body: { nombreEstadoUsuario?: string; fechaFin?: string | null }
): Promise<boolean>;

export function deactivateUserState(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

// Users (admin) ABM
export interface AdminUserDTO {
  id: number | string;
  nombre: string;
  email?: string;
  rol?: string;
  activo?: boolean;
}

export function listAdminUsers(
  params?: Record<string, unknown>,
  token?: string
): Promise<AdminUserDTO[]>;

export function createAdminUser(
  body: {
    nombre: string;
    apellido?: string;
    email: string;
    correo?: string;
    dni?: string;
    fechaNac?: string;
    idGenero?: number | string | null;
    idLocalidad?: number | string | null;
    rol?: string;
    idGrupo?: number | string | null;
    idGrupos?: Array<number | string>;
    idEstadoUsuario?: number | string | null;
    estadoInicial?: string | number | null;
  },
  token?: string
): Promise<boolean>;

export function updateUser(
  id: number | string,
  body: {
    nombre: string;
    apellido: string;
    email: string;
    grupos: Array<number | string>;
    idEstado: number | string | null;
    idEstadoUsuario?: number | string | null;
    idGrupo?: number | string | null;
    idGrupos?: Array<number | string>;
    estadoInicial?: number | string | null;
  }
): Promise<boolean>;

/** @deprecated usar updateUser */
export function updateAdminUser(
  id: number | string,
  body: { nombre: string; apellido?: string; email: string }
): Promise<boolean>;

export function deactivateAdminUser(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

// Permissions ABM
export interface PermissionDTO {
  id: number | string;
  nombrePermiso: string;
  descripcion?: string;
  activo?: boolean;
}

export function listPermissions(
  params?: Record<string, unknown>,
  token?: string
): Promise<PermissionDTO[]>;

// Export / descarga de historial de accesos
export function exportAccessHistoryFile(
  params?: Record<string, unknown>,
  filename?: string,
  format?: string,
  token?: string
): Promise<void>;

export function createPermission(body: {
  nombrePermiso: string;
  descripcion?: string;
}): Promise<boolean>;

export function updatePermission(
  id: number | string,
  body: { nombrePermiso?: string; descripcion?: string }
): Promise<boolean>;

export function deactivatePermission(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;

// User-specific permissions
export function userPermissions(
  userId: number | string,
  token?: string
): Promise<PermissionDTO[]>;

export interface UserStateHistoryDTO {
  idEstadoUsuario: number;
  nombreEstadoUsuario: string;
  fechaInicio: string;
  fechaFin: string | null;
}

export function getUserStateHistory(
  userId: number | string,
  token?: string
): Promise<UserStateHistoryDTO[]>;

export function addUserPermission(
  userId: number | string,
  idPermiso: number | string,
  token?: string
): Promise<boolean>;

export function updateUserPermissions(
  userId: number | string,
  permisos: Array<number | string>,
  token?: string
): Promise<boolean>;

export function removeUserPermission(
  userId: number | string,
  permisoId: number | string,
  token?: string
): Promise<boolean>;

// Catalog groups ABM (Grupos de usuarios)
export interface GroupCatalogDTO {
  id: number | string;
  nombreGrupo: string;
  descripcion?: string;
  permisos?: Array<number | string>;
  activo?: boolean;
}

export function listGroupsCatalog(
  params?: Record<string, unknown>,
  token?: string
): Promise<GroupCatalogDTO[]>;

export function createGroupCatalog(
  body: {
    nombreGrupo: string;
    descripcion?: string;
    permisos?: Array<number | string>;
  },
  token?: string
): Promise<boolean>;

export function updateGroupCatalog(
  id: number | string,
  body: {
    nombreGrupo?: string;
    descripcion?: string;
    permisos?: Array<number | string>;
  },
  token?: string
): Promise<boolean>;

export function deactivateGroupCatalog(
  id: number | string,
  nombreGrupo?: string,
  token?: string
): Promise<boolean>;

// Access history
export function accessHistory(
  params?: Record<string, unknown>,
  token?: string
): Promise<unknown>;

export function exportAccessHistory(
  params?: Record<string, unknown>,
  token?: string
): Promise<Blob>;

// System audit
export function audit(
  params?: Record<string, unknown>,
  token?: string
): Promise<unknown>;

export function exportAudit(
  params?: Record<string, unknown>,
  token?: string
): Promise<Blob>;

export function exportAuditFile(
  params?: Record<string, unknown>,
  filename?: string,
  format?: string,
  token?: string
): Promise<void>;

// Simple users list for access history page
export interface BasicUserDTO {
  id: number | string;
  nombre?: string;
  apellido?: string;
  mail?: string;
  email?: string;
}

export function listUsers(
  token?: string,
  params?: Record<string, unknown>
): Promise<BasicUserDTO[]>;

// Skills (Aptitudes)
export interface SkillDTO {
  id: number | string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export function listSkills(
  params?: Record<string, unknown>,
  token?: string
): Promise<SkillDTO[]>;

export function createSkill(
  body: {
    nombre: string;
    descripcion?: string;
  },
  token?: string
): Promise<boolean>;

export function updateSkill(
  id: number | string,
  body: { nombre: string; descripcion?: string },
  token?: string
): Promise<boolean>;

export function deactivateSkill(
  id: number | string,
  nombre?: string,
  token?: string
): Promise<boolean>;
