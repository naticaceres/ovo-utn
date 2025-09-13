export interface CareerTypeDTO {
  id: number | string;
  nombre: string;
  activo?: boolean;
}

export function listCareerTypes(): Promise<CareerTypeDTO[]>;
export function createCareerType(body: { nombre: string }): Promise<boolean>;
export function updateCareerType(
  id: number | string,
  body: { nombre: string }
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
}

export function listCareerStates(
  params?: Record<string, unknown>,
  token?: string
): Promise<CareerStateDTO[]>;
export function createCareerState(body: { nombre: string }): Promise<boolean>;
export function updateCareerState(
  id: number | string,
  body: { nombre: string }
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
}

export function listCareersBase(
  params?: Record<string, unknown>,
  token?: string
): Promise<CareerBaseDTO[]>;
export function createCareerBase(body: {
  nombre: string;
  idTipoCarrera?: number | string;
}): Promise<boolean>;
export function updateCareerBase(
  id: number | string,
  body: { nombre: string; idTipoCarrera?: number | string }
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
  token?: string
): Promise<boolean>;

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
  body: { nombreEstadoUsuario?: string }
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

export function createAdminUser(body: {
  nombre: string;
  apellido?: string;
  email: string;
  rol?: string;
  idGrupo?: number | string | null;
  idGrupos?: Array<number | string>;
  idEstadoUsuario?: number | string | null;
  estadoInicial?: string | number | null;
}): Promise<boolean>;

export function updateAdminUser(
  id: number | string,
  body: {
    nombre: string;
    apellido?: string;
    email?: string;
    rol?: string;
    password?: string;
    idGrupo?: number | string | null;
    idGrupos?: Array<number | string>;
    idEstadoUsuario?: number | string | null;
  }
): Promise<boolean>;

export function blockAdminUser(
  id: number | string,
  token?: string
): Promise<boolean>;
export function unblockAdminUser(
  id: number | string,
  token?: string
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

export function addUserPermission(
  userId: number | string,
  idPermiso: number | string,
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

export function createGroupCatalog(body: {
  nombreGrupo: string;
  descripcion?: string;
  permisos?: Array<number | string>;
}): Promise<boolean>;

export function updateGroupCatalog(
  id: number | string,
  body: {
    nombreGrupo?: string;
    descripcion?: string;
    permisos?: Array<number | string>;
  }
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
