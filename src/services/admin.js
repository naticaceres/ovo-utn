import { api } from '../context/api';

export async function listCareerTypes(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/career-types', {
      params,
      headers,
    });

    // Normalize to an array of { id, nombre, activo }
    let raw = data;
    if (data && data.careerTypes) raw = data.careerTypes;
    else if (data && data.tipoCarreras) raw = data.tipoCarreras;

    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idTipoCarrera ?? item.id ?? item._id,
        nombre: item.nombreTipo ?? item.nombre ?? item.title ?? '',
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
      }));
    }

    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Institution requests ---
export async function listInstitutionRequests(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/institutions/requests', {
      params,
      headers,
    });
    // expect an array or wrapped object
    const raw = data && data.requests ? data.requests : data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function approveInstitutionRequest(id, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post(
      `/api/v1/admin/institutions/requests/${id}/approve`,
      {},
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function rejectInstitutionRequest(id, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post(
      `/api/v1/admin/institutions/requests/${id}/reject`,
      {},
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createCareerType(payload) {
  try {
    const { data } = await api.post('/api/v1/admin/career-types', payload);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateCareerType(id, payload) {
  try {
    const { data } = await api.put(`/api/v1/admin/career-types/${id}`, payload);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// logical delete / deactivate
export async function deactivateCareerType(id) {
  try {
    const { data } = await api.post(
      `/api/v1/admin/career-types/${id}/deactivate`
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
export async function listUsers(token, params = {}) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/users', { headers, params });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Users management (ABM) ---
export async function listAdminUsers(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/users', { headers, params });
    // Normalize to array of { id, nombre, email, rol, activo }
    const raw = data && data.users ? data.users : data;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(u => ({
        id: u.id ?? u.userId ?? u._id,
        // keep first and last name separate when possible
        nombre: u.nombre ?? u.firstName ?? u.name ?? '',
        apellido: u.apellido ?? u.lastName ?? '',
        // accept many possible email field names returned by different backends
        email:
          u.email ??
          u.username ??
          u.mail ??
          u.correo ??
          u.correoElectronico ??
          u.emailAddress ??
          '',
        rol: u.rol ?? u.role ?? (u.roles && u.roles[0]) ?? 'Usuario',
        activo: typeof u.activo !== 'undefined' ? u.activo : (u.active ?? true),
        // try to capture group / state ids when present in payload
        idGrupo:
          u.idGrupo ??
          u.groupId ??
          u.group ??
          (u.groups && u.groups[0]) ??
          null,
        idEstadoUsuario:
          u.idEstadoUsuario ??
          u.estadoId ??
          (u.estado && (u.estado.id || u.estadoId)) ??
          u.stateId ??
          null,
        estadoNombre:
          u.estadoNombre ??
          u.nombreEstado ??
          (u.estado && u.estado.nombre) ??
          null,
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createAdminUser(payload) {
  try {
    // backend catalog endpoint expects nombre, apellido, email, estadoInicial
    const body = {
      nombre: payload.nombre,
      apellido: payload.apellido,
      email: payload.email,
      estadoInicial: payload.idEstadoUsuario ?? payload.estadoInicial ?? null,
      idGrupo: payload.idGrupo,
    };
    const { data } = await api.post('/api/v1/admin/catalog/users', body);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateAdminUser(id, payload) {
  try {
    const body = {
      nombre: payload.nombre,
      apellido: payload.apellido,
      // email not editable in-place in our UI, include if present
      ...(payload.email ? { email: payload.email } : {}),
      estadoInicial: payload.idEstadoUsuario ?? payload.estadoInicial ?? null,
      idGrupo: payload.idGrupo,
    };
    const { data } = await api.put(`/api/v1/admin/catalog/users/${id}`, body);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateAdminUser(id, nombre, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // Some APIs expect a DELETE with body containing name for confirmation
    const { data } = await api.delete(`/api/v1/admin/users/${id}`, {
      headers,
      data: { nombre },
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function blockAdminUser(id, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post(
      `/api/v1/admin/catalog/users/${id}/block`,
      {},
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function unblockAdminUser(id, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post(
      `/api/v1/admin/catalog/users/${id}/unblock`,
      {},
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function listGroups(token, params = {}) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/groups', { headers, params });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function userGroups(userId, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get(`/api/v1/admin/users/${userId}/groups`, {
      headers,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function userPermissions(userId, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get(
      `/api/v1/admin/users/${userId}/permissions`,
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function assignGroup(userId, idGrupo, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.put(
      `/api/v1/admin/users/${userId}/group`,
      { idGrupo },
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function removeGroup(userId, groupId, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(
      `/api/v1/admin/users/${userId}/group/${groupId}`,
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function listPermissions(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/permissions', {
      headers,
      params,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- User states (ABM for user states) ---
export async function listUserStates(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/user-states', {
      params,
      headers,
    });
    const raw = data && data.userStates ? data.userStates : data;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(s => ({
        id: s.idEstadoUsuario ?? s.id ?? s._id,
        nombre: s.nombreEstadoUsuario ?? s.nombreEstado ?? s.nombre ?? '',
        activo: typeof s.activo !== 'undefined' ? s.activo : true,
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function addUserPermission(userId, idPermiso, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post(
      `/api/v1/admin/users/${userId}/permissions`,
      { idPermiso },
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function removeUserPermission(userId, permisoId, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(
      `/api/v1/admin/users/${userId}/permissions/${permisoId}`,
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function accessHistory(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/access-history', {
      headers,
      params,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function exportAccessHistory(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/access-history/export', {
      headers,
      params,
      responseType: 'blob',
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function audit(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/audit', { headers, params });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function exportAudit(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/audit/export', {
      headers,
      params,
      responseType: 'blob',
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function adminStatsSystem(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/stats/system', {
      headers,
      params,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function adminStatsUsers(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/stats/users', {
      headers,
      params,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Career modalities (ABM) ---
export async function listModalities(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/career-modalities', {
      params,
      headers,
    });
    // The API may return { careerModalities: [...] } or an array directly.
    // Normalize to an array of { id, nombre, activo } used by the UI.
    const raw = data && data.careerModalities ? data.careerModalities : data;
    if (!raw) return [];

    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idModalidadCarreraInstitucion ?? item.id ?? item._id,
        nombre: item.nombreModalidad ?? item.nombre ?? item.title ?? '',
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
      }));
    }

    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Institution types (ABM) ---
export async function listInstitutionTypes(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/institution-types', {
      params,
      headers,
    });
    let raw = data;
    if (data && data.institutionTypes) raw = data.institutionTypes;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idTipoInstitucion ?? item.id ?? item._id,
        nombre:
          item.nombreTipoInstitucion ??
          item.nombreTipo ??
          item.nombre ??
          item.title ??
          '',
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createInstitutionType(payload) {
  try {
    const body = { nombreTipoInstitucion: payload.nombre };
    const { data } = await api.post(
      '/api/v1/admin/catalog/institution-types',
      body
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateInstitutionType(id, payload) {
  try {
    const body = { nombreTipoInstitucion: payload.nombre };
    const { data } = await api.put(
      `/api/v1/admin/catalog/institution-types/${id}`,
      body
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateInstitutionType(id, nombre, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(
      `/api/v1/admin/catalog/institution-types/${id}`,
      {
        headers,
        data: { nombreTipoInstitucion: nombre },
      }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Institution states (ABM) ---
export async function listInstitutionStates(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/institution-states', {
      params,
      headers,
    });
    let raw = data;
    if (data && data.institutionStates) raw = data.institutionStates;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idEstadoInstitucion ?? item.id ?? item._id,
        nombre:
          item.nombreEstadoInstitucion ??
          item.nombreEstado ??
          item.nombre ??
          '',
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createInstitutionState(payload) {
  try {
    const body = { nombreEstadoInstitucion: payload.nombre };
    const { data } = await api.post(
      '/api/v1/admin/catalog/institution-states',
      body
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateInstitutionState(id, payload) {
  try {
    const body = { nombreEstadoInstitucion: payload.nombre };
    const { data } = await api.put(
      `/api/v1/admin/catalog/institution-states/${id}`,
      body
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateInstitutionState(id, nombre, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(
      `/api/v1/admin/catalog/institution-states/${id}`,
      {
        headers,
        data: { nombreEstadoInstitucion: nombre },
      }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createModality(payload) {
  try {
    // backend expects nombreModalidad
    const body = { nombreModalidad: payload.nombre };
    const { data } = await api.post(
      '/api/v1/admin/catalog/career-modalities',
      body
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateModality(id, payload) {
  try {
    const body = { nombreModalidad: payload.nombre };
    const { data } = await api.put(
      `/api/v1/admin/catalog/career-modalities/${id}`,
      body
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateModality(id, nombreModalidad, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // Some backends accept DELETE with a request body via axios config.data
    const { data } = await api.delete(
      `/api/v1/admin/catalog/career-modalities/${id}`,
      {
        headers,
        data: { nombreModalidad },
      }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Career institution states (ABM) ---
export async function listCareerStates(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get(
      '/api/v1/admin/catalog/career-institution-statuses',
      {
        params,
        headers,
      }
    );

    // The API may return an array directly or an object wrapping the array
    // under `careerStates` or `careerInstitutionStatuses`. Normalize to
    // an array of { id, nombre, activo } used by the UI.
    let raw = data;
    if (data && data.careerStates) raw = data.careerStates;
    else if (data && data.careerInstitutionStatuses)
      raw = data.careerInstitutionStatuses;

    if (!raw) return [];

    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idEstadoCarreraInstitucion ?? item.id ?? item._id,
        nombre:
          item.nombreEstadoCarreraInstitucion ??
          item.nombreEstado ??
          item.nombre ??
          item.title ??
          '',
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
      }));
    }

    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createCareerState(payload) {
  try {
    // backend expects nombreEstadoCarreraInstitucion
    const body = { nombreEstadoCarreraInstitucion: payload.nombre };
    const { data } = await api.post(
      '/api/v1/admin/catalog/career-institution-statuses',
      body
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateCareerState(id, payload) {
  try {
    const body = { nombreEstadoCarreraInstitucion: payload.nombre };
    const { data } = await api.put(
      `/api/v1/admin/catalog/career-institution-statuses/${id}`,
      body
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateCareerState(id, nombreEstado, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(
      `/api/v1/admin/catalog/career-institution-statuses/${id}`,
      {
        headers,
        // include the expected name key in the body
        data: { nombreEstadoCarreraInstitucion: nombreEstado },
      }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Careers base (ABM) ---
export async function listCareersBase(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/careers', {
      params,
      headers,
    });

    // backend might return an array or a wrapped object; normalize
    const raw = data && data.careers ? data.careers : data;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idCarrera ?? item.id ?? item._id,
        nombre: item.nombreCarrera ?? item.nombre ?? item.title ?? '',
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
        idTipoCarrera:
          item.idTipoCarrera ??
          item.idTipo ??
          item.idTipoCarreraInstitucion ??
          null,
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createCareerBase(payload) {
  try {
    // backend expects nombreCarrera and possibly idTipoCarrera
    const body = { nombreCarrera: payload.nombre };
    if (payload && payload.idTipoCarrera)
      body.idTipoCarrera = payload.idTipoCarrera;
    const { data } = await api.post('/api/v1/admin/catalog/careers', body);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateCareerBase(id, payload) {
  try {
    const body = { nombreCarrera: payload.nombre };
    if (payload && payload.idTipoCarrera)
      body.idTipoCarrera = payload.idTipoCarrera;
    const { data } = await api.put(`/api/v1/admin/catalog/careers/${id}`, body);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateCareerBase(id, nombreCarrera, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(`/api/v1/admin/catalog/careers/${id}`, {
      headers,
      data: { nombreCarrera },
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
