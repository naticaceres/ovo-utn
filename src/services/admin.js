import { api } from '../context/api';

export async function listUsers(token, params = {}) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/admin/users', { headers, params });
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
