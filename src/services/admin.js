import { api } from '../context/api';

export async function listCareerTypes(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/career-types', {
      params,
      headers,
    });

    console.log('[listCareerTypes] Raw response:', data);

    // Based on the API response structure: { "careerTypes": [...] }
    let raw = data;
    if (data && data.careerTypes) raw = data.careerTypes;
    else if (data && data.tipoCarreras) raw = data.tipoCarreras;
    else if (data && data.data) raw = data.data;

    if (!raw || !Array.isArray(raw)) return [];

    return raw.map((item, index) => {
      const id = item.idTipoCarrera ?? item.id ?? item._id;
      const nombre =
        item.nombreTipoCarrera ??
        item.nombreTipo ??
        item.nombre ??
        item.title ??
        '';

      console.log(`[listCareerTypes] Mapping item ${index}:`, {
        original: item,
        extractedId: id,
        extractedNombre: nombre,
      });

      const fechaFin =
        item.fechaFin ??
        item.fecha_fin ??
        item.fechaBaja ??
        item.fecha_baja ??
        item.endDate ??
        item.end_date ??
        null;
      const activo = fechaFin
        ? false
        : typeof item.activo !== 'undefined'
          ? item.activo
          : true;

      return {
        id,
        nombre,
        fechaFin,
        activo,
      };
    });
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
    // La respuesta puede tener estructura { solicitudes: [...] } o { requests: [...] } o directamente un array
    let raw = data;
    if (data && data.solicitudes) {
      raw = data.solicitudes;
    } else if (data && data.requests) {
      raw = data.requests;
    }

    if (!raw) return [];
    if (Array.isArray(raw)) {
      // Mapear los datos para que coincidan con la estructura esperada
      return raw.map(item => ({
        id: item.idInstitucion ?? item.id ?? '',
        nombre: item.nombre ?? '',
        tipo: item.tipoId ?? item.tipo ?? '',
        localizacion: item.localizacion ?? 'N/D',
        estado: item.estado ?? 'PENDIENTE',
        email: item.email ?? '',
        fechaSolicitud: item.fechaSolicitud ?? '',
        tipoId: item.tipoId,
        justificacion: item.justificacion ?? null,
      }));
    }
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

export async function rejectInstitutionRequest(id, justificacion, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post(
      `/api/v1/admin/institutions/requests/${id}/reject`,
      { justificacion },
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateInstitution(id, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post(
      `/api/v1/admin/institutions/${id}/deactivate`,
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
    const { data } = await api.post(
      '/api/v1/admin/catalog/career-types',
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateCareerType(id, payload) {
  try {
    const { data } = await api.put(
      `/api/v1/admin/catalog/career-types/${id}`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// logical delete / deactivate
export async function deactivateCareerType(id) {
  try {
    const { data } = await api.delete(
      `/api/v1/admin/catalog/career-types/${id}`
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
        // detect fecha fin for users (if present) and derive activo
        fechaFin:
          u.fechaFin ??
          u.fecha_fin ??
          u.fechaBaja ??
          u.fecha_baja ??
          u.endDate ??
          u.end_date ??
          null,
        activo:
          (u.fechaFin ??
          u.fecha_fin ??
          u.fechaBaja ??
          u.fecha_baja ??
          u.endDate ??
          u.end_date)
            ? false
            : typeof u.activo !== 'undefined'
              ? u.activo
              : (u.active ?? true),
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
        // estado textual directo si el backend lo provee (por ejemplo "Activo", "Suspendido")
        estado:
          u.estado ??
          (u.estado && u.estado.nombre ? u.estado.nombre : null) ??
          null,
        // Preservar arrays de permisos para la gestión de permisos dinámicos
        permisos_directos: u.permisos_directos || [],
        permisos_de_grupo: u.permisos_de_grupo || [],
        grupos: u.grupos || [],
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createAdminUser(payload, token) {
  try {
    // backend catalog endpoint expects correo, dni, nombre, apellido, fechaNac, idGenero, idLocalidad, estadoInicial
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const body = {
      correo: payload.email ?? payload.correo,
      dni: payload.dni,
      nombre: payload.nombre,
      apellido: payload.apellido,
      fechaNac: payload.fechaNac,
      idGenero: payload.idGenero,
      idLocalidad: payload.idLocalidad,
      estadoInicial:
        payload.estadoInicial ?? payload.idEstadoUsuario ?? 'activo',
    };
    const { data } = await api.post('/api/v1/admin/catalog/users', body, {
      headers,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// Unified user update (admins or regular users via admin panel)
export async function updateUser(id, payload) {
  try {
    const body = {
      nombre: payload.nombre,
      apellido: payload.apellido,
      email: payload.email,
      grupos: Array.isArray(payload.grupos)
        ? payload.grupos
        : typeof payload.idGrupos !== 'undefined' &&
            Array.isArray(payload.idGrupos)
          ? payload.idGrupos
          : typeof payload.idGrupo !== 'undefined' && payload.idGrupo !== null
            ? [payload.idGrupo]
            : [],
      idEstado:
        payload.idEstado ??
        payload.idEstadoUsuario ??
        payload.estadoInicial ??
        null,
    };
    const { data } = await api.put(`/api/v1/admin/catalog/users/${id}`, body);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// Backwards compatibility: keep old name if still imported elsewhere
export async function updateAdminUser(id, payload) {
  return updateUser(id, payload);
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
    // use catalog endpoint to match create/update/delete which use /catalog/permissions
    const { data } = await api.get('/api/v1/admin/catalog/permissions', {
      headers,
      params,
    });
    // normalize response: may be array or wrapped object
    const raw =
      data && data.permissions
        ? data.permissions
        : data && data.catalogPermissions
          ? data.catalogPermissions
          : data;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(p => {
        const id = p.id ?? p.idPermiso ?? p._id;
        const nombre = p.nombrePermiso ?? p.nombre ?? '';
        const descripcion = p.descripcion ?? p.description ?? '';
        const fechaFin =
          p.fechaFin ??
          p.fecha_fin ??
          p.fechaBaja ??
          p.fecha_baja ??
          p.endDate ??
          p.end_date ??
          '';
        const activo =
          fechaFin && String(fechaFin).trim() !== ''
            ? false
            : typeof p.activo !== 'undefined'
              ? p.activo
              : true;
        return {
          id,
          nombre,
          descripcion,
          activo,
          fechaFin: fechaFin ?? null,
        };
      });
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Catalog groups (ABM Grupos de Usuarios) ---
export async function listGroupsCatalog(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/groups', {
      headers,
      params,
    });

    console.log('[listGroupsCatalog] Raw response data:', data);

    const raw =
      data && data.groups ? data.groups : data && data.data ? data.data : data;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((g, index) => {
        const id = g.id ?? g._id ?? g.idGrupo ?? g.groupId ?? g.grupo_id;
        console.log(`[listGroupsCatalog] Group ${index}:`, {
          originalGroup: g,
          extractedId: id,
          hasId: !!id,
        });

        const nombre = g.nombreGrupo ?? g.nombre ?? g.label ?? '';
        const descripcion = g.descripcion ?? g.description ?? '';
        const permisos = g.permisos ?? g.permissions ?? [];
        const fechaFin =
          g.fechaFin ??
          g.fecha_fin ??
          g.fechaBaja ??
          g.fecha_baja ??
          g.endDate ??
          g.end_date ??
          '';
        const activo =
          fechaFin && String(fechaFin).trim() !== ''
            ? false
            : typeof g.activo !== 'undefined'
              ? g.activo
              : true;
        return {
          id,
          nombreGrupo: nombre,
          descripcion,
          permisos,
          activo,
          fechaFin: fechaFin ?? null,
        };
      });
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createGroupCatalog(payload, token) {
  try {
    // payload: { nombreGrupo, descripcion, permisos: [id,...] }
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post('/api/v1/admin/catalog/groups', payload, {
      headers,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateGroupCatalog(id, payload, token) {
  try {
    console.log('[updateGroupCatalog] ID received:', id, 'Type:', typeof id);

    if (!id) {
      throw new Error('ID del grupo es requerido para actualizar');
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const url = `/api/v1/admin/catalog/groups/${id}`;
    console.log('[updateGroupCatalog] URL:', url);

    const { data } = await api.put(url, payload, { headers });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateGroupCatalog(id, nombreGrupo, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // Try DELETE without body first (some backends accept that)
    try {
      const { data } = await api.delete(`/api/v1/admin/catalog/groups/${id}`, {
        headers,
      });
      return data;
    } catch (err) {
      // If server rejects DELETE without body, retry sending confirmation body
      try {
        const { data } = await api.delete(
          `/api/v1/admin/catalog/groups/${id}`,
          { headers, data: { nombreGrupo } }
        );
        return data;
      } catch (err2) {
        throw err2.response ? err2.response.data : err2;
      }
    }
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createPermission(payload) {
  try {
    // expected payload: { nombrePermiso, descripcion }
    const { data } = await api.post(
      '/api/v1/admin/catalog/permissions',
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updatePermission(id, payload) {
  try {
    const { data } = await api.put(
      `/api/v1/admin/catalog/permissions/${id}`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivatePermission(id, nombre, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // Try DELETE without body first
    try {
      const { data } = await api.delete(
        `/api/v1/admin/catalog/permissions/${id}`,
        { headers }
      );
      return data;
    } catch (err) {
      // Retry with confirmation body if server expects it
      try {
        const { data } = await api.delete(
          `/api/v1/admin/catalog/permissions/${id}`,
          { headers, data: { nombrePermiso: nombre } }
        );
        return data;
      } catch (err2) {
        throw err2.response ? err2.response.data : err2;
      }
    }
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- User states (ABM for user states) ---
export async function listUserStates(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // use the plural 'user-statuses' endpoint (some backends return userStatuses)
    const { data } = await api.get('/api/v1/admin/catalog/user-statuses', {
      params,
      headers,
    });
    const raw =
      data && data.userStatuses
        ? data.userStatuses
        : data && data.userStates
          ? data.userStates
          : data;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(s => {
        // detect possible fecha fin fields
        const fechaFin =
          s.fechaFin ??
          s.fecha_fin ??
          s.fechaBaja ??
          s.fecha_baja ??
          s.fechaHasta ??
          s.fecha_hasta ??
          s.endDate ??
          s.end_date ??
          null;
        const hasFechaFin = fechaFin !== null && String(fechaFin).trim() !== '';
        return {
          id: s.idEstadoUsuario ?? s.id ?? s._id,
          nombre: s.nombreEstadoUsuario ?? s.nombreEstado ?? s.nombre ?? '',
          // if fechaFin exists => considered 'Baja' -> activo false; otherwise respect provided activo or default true
          activo: hasFechaFin
            ? false
            : typeof s.activo !== 'undefined'
              ? s.activo
              : true,
          fechaFin: fechaFin ?? null,
        };
      });
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createUserState(payload) {
  try {
    // payload: { nombreEstadoUsuario }
    const { data } = await api.post(
      '/api/v1/admin/catalog/user-statuses',
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateUserState(id, payload) {
  try {
    const { data } = await api.put(
      `/api/v1/admin/catalog/user-statuses/${id}`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateUserState(id, nombre, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // try simple DELETE first
    try {
      const { data } = await api.delete(
        `/api/v1/admin/catalog/user-statuses/${id}`,
        { headers }
      );
      return data;
    } catch (err) {
      try {
        const { data } = await api.delete(
          `/api/v1/admin/catalog/user-statuses/${id}`,
          { headers, data: { nombreEstadoUsuario: nombre } }
        );
        return data;
      } catch (err2) {
        throw err2.response ? err2.response.data : err2;
      }
    }
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

export async function updateUserPermissions(userId, permisos, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.put(
      `/api/v1/admin/users/${userId}/permissions`,
      { permisos },
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

// Descarga directa del archivo (evita lógica de crear link en la página)
export async function exportAccessHistoryFile(
  params = {},
  filename = 'access-history',
  format = 'csv',
  token
) {
  const { downloadFile } = await import('./file');
  const finalName = `${filename}.${format}`;

  // Set expected content type based on format
  const expectedContentType = format === 'pdf' ? 'application/pdf' : 'text/csv';

  await downloadFile({
    url: '/api/v1/admin/access-history/export',
    params: { ...params, format }, // Ensure format is passed to backend
    filename: finalName,
    token,
    expectedContentType,
  });
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

// Nueva función unificada para audit que usa downloadFile
export async function exportAuditFile(
  params = {},
  filename = 'audit',
  format = 'csv',
  token
) {
  const { downloadFile } = await import('./file');
  const finalName = `${filename}.${format}`;

  // Set expected content type based on format
  const expectedContentType = format === 'pdf' ? 'application/pdf' : 'text/csv';

  await downloadFile({
    url: '/api/v1/admin/audit/export',
    params: { ...params, format },
    filename: finalName,
    token,
    expectedContentType,
  });
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

// --- Countries (ABM Países) ---
export async function listCountries(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/countries', {
      params,
      headers,
    });
    let raw = data;
    if (data && data.countries) raw = data.countries;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idPais ?? item.id ?? item._id,
        nombre: item.nombrePais ?? item.nombre ?? item.name ?? '',
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createCountry(payload) {
  try {
    const body = { nombrePais: payload.nombre };
    const { data } = await api.post('/api/v1/admin/catalog/countries', body);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateCountry(id, payload) {
  try {
    const body = { nombrePais: payload.nombre };
    const { data } = await api.put(
      `/api/v1/admin/catalog/countries/${id}`,
      body
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateCountry(id, nombre, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(`/api/v1/admin/catalog/countries/${id}`, {
      headers,
      data: { nombrePais: nombre },
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Provinces (ABM Provincias) ---
export async function listProvinces(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/provinces', {
      params,
      headers,
    });
    let raw = data;
    if (data && data.provinces) raw = data.provinces;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idProvincia ?? item.id ?? item._id,
        nombre: item.nombreProvincia ?? item.nombre ?? item.name ?? '',
        idPais: item.idPais ?? item.countryId ?? null,
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createProvince(payload, token) {
  try {
    const body = { nombreProvincia: payload.nombre, idPais: payload.idPais };
    console.log('[createProvince] Payload being sent:', body);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post('/api/v1/admin/catalog/provinces', body, {
      headers,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateProvince(id, payload, token) {
  try {
    const body = { nombreProvincia: payload.nombre, idPais: payload.idPais };
    console.log('[updateProvince] Payload being sent:', body);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.put(
      `/api/v1/admin/catalog/provinces/${id}`,
      body,
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateProvince(id, nombre, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(`/api/v1/admin/catalog/provinces/${id}`, {
      headers,
      data: { nombreProvincia: nombre },
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Localities (ABM Localidades) ---
export async function listLocalities(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/localities', {
      params,
      headers,
    });
    let raw = data;
    if (data && data.localities) raw = data.localities;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idLocalidad ?? item.id ?? item._id,
        nombre:
          item.nombreLocalidad ??
          item.nombre ??
          item.name ??
          item.nombreLocalidad ??
          '',
        idProvincia: item.idProvincia ?? item.provinceId ?? null,
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createLocality(payload, token) {
  try {
    const body = {
      nombreLocalidad: payload.nombre,
      idProvincia: payload.idProvincia,
    };
    console.log('[createLocality] Payload being sent:', body);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post('/api/v1/admin/catalog/localities', body, {
      headers,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateLocality(id, payload, token) {
  try {
    const body = {
      nombreLocalidad: payload.nombre,
      idProvincia: payload.idProvincia,
    };
    console.log('[updateLocality] Payload being sent:', body);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.put(
      `/api/v1/admin/catalog/localities/${id}`,
      body,
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateLocality(id, nombre, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(
      `/api/v1/admin/catalog/localities/${id}`,
      {
        headers,
        data: { nombreLocalidad: nombre },
      }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Genders (ABM Géneros) ---
export async function listGenders(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/genders', {
      params,
      headers,
    });
    let raw = data;
    if (data && data.genders) raw = data.genders;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idGenero ?? item.id ?? item._id,
        nombre: item.nombreGenero ?? item.nombre ?? item.name ?? '',
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createGender(payload) {
  try {
    const body = { nombreGenero: payload.nombre };
    const { data } = await api.post('/api/v1/admin/catalog/genders', body);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateGender(id, payload) {
  try {
    const body = { nombreGenero: payload.nombre };
    const { data } = await api.put(`/api/v1/admin/catalog/genders/${id}`, body);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateGender(id, nombre, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(`/api/v1/admin/catalog/genders/${id}`, {
      headers,
      data: { nombreGenero: nombre },
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// --- Action types (ABM Tipos de Acciones del sistema) ---
export async function listActionTypes(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/action-types', {
      params,
      headers,
    });
    let raw = data;
    if (data && data.actionTypes) raw = data.actionTypes;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idTipoAccion ?? item.id ?? item._id,
        nombre: item.nombreTipoAccion ?? item.nombre ?? item.name ?? '',
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createActionType(payload) {
  try {
    const body = { nombreTipoAccion: payload.nombre };
    const { data } = await api.post('/api/v1/admin/catalog/action-types', body);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateActionType(id, payload) {
  try {
    const body = { nombreTipoAccion: payload.nombre };
    const { data } = await api.put(
      `/api/v1/admin/catalog/action-types/${id}`,
      body
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateActionType(id, nombre, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(
      `/api/v1/admin/catalog/action-types/${id}`,
      { headers, data: { nombreTipoAccion: nombre } }
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
    const { data } = await api.get(
      '/api/v1/admin/catalog/careers?includeInactive=1',
      {
        params,
        headers,
      }
    );

    // backend might return an array or a wrapped object; normalize
    const raw = data && data.careers ? data.careers : data;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idCarrera ?? item.id ?? item._id,
        nombre: item.nombreCarrera ?? item.nombre ?? item.title ?? '',
        fechaFin:
          item.fechaFin ??
          item.fecha_fin ??
          item.fechaBaja ??
          item.fecha_baja ??
          item.endDate ??
          item.end_date ??
          null,
        activo:
          (item.fechaFin ??
          item.fecha_fin ??
          item.fechaBaja ??
          item.fecha_baja ??
          item.endDate ??
          item.end_date)
            ? false
            : typeof item.activo !== 'undefined'
              ? item.activo
              : true,
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

export async function createCareerBase(payload, token) {
  try {
    // backend expects nombreCarrera and possibly idTipoCarrera, fechaFin
    const body = { nombreCarrera: payload.nombre };
    if (payload && payload.idTipoCarrera)
      body.idTipoCarrera = payload.idTipoCarrera;

    // Always include fechaFin - either the date or "NULL" string to cancel/clear
    if (
      payload.fechaFin === 'NULL' ||
      payload.fechaFin === '' ||
      !payload.fechaFin
    ) {
      body.fechaFin = 'NULL';
    } else {
      body.fechaFin = payload.fechaFin;
    }

    console.log('[createCareerBase] Payload being sent:', body);
    console.log(
      '[createCareerBase] fechaFin processing: input=',
      payload.fechaFin,
      'output=',
      body.fechaFin
    );

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post('/api/v1/admin/catalog/careers', body, {
      headers,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateCareerBase(id, payload, token) {
  try {
    const body = { nombreCarrera: payload.nombre };
    if (payload && payload.idTipoCarrera)
      body.idTipoCarrera = payload.idTipoCarrera;

    // Always include fechaFin - either the date or "NULL" string to cancel/clear existing date
    if (
      payload.fechaFin === 'NULL' ||
      payload.fechaFin === '' ||
      !payload.fechaFin
    ) {
      body.fechaFin = 'NULL';
    } else {
      body.fechaFin = payload.fechaFin;
    }

    console.log('[updateCareerBase] ID:', id, 'Payload being sent:', body);
    console.log(
      '[updateCareerBase] fechaFin value:',
      payload.fechaFin,
      'Sending:',
      body.fechaFin
    );

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.put(
      `/api/v1/admin/catalog/careers/${id}`,
      body,
      { headers }
    );
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

// Skills (Aptitudes)
export async function listSkills(params = {}, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/catalog/aptitudes', {
      params,
      headers,
    });
    let raw = data;
    if (data && data.aptitudes) raw = data.aptitudes;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(item => ({
        id: item.idAptitud ?? item.id ?? item._id,
        nombre: item.nombreAptitud ?? item.nombre ?? item.name ?? '',
        descripcion: item.descripcion ?? '',
        activo: typeof item.activo !== 'undefined' ? item.activo : true,
      }));
    }
    return [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createSkill(payload, token) {
  try {
    const body = {
      nombreAptitud: payload.nombre,
      descripcion: payload.descripcion || '',
    };
    console.log('[createSkill] Payload being sent:', body);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post('/api/v1/admin/catalog/aptitudes', body, {
      headers,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateSkill(id, payload, token) {
  try {
    const body = {
      nombreAptitud: payload.nombre,
      descripcion: payload.descripcion || '',
    };
    console.log('[updateSkill] Payload being sent:', body);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.put(
      `/api/v1/admin/catalog/aptitudes/${id}`,
      body,
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivateSkill(id, nombre, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete(`/api/v1/admin/catalog/aptitudes/${id}`, {
      headers,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
