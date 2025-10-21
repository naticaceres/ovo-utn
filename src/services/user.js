import { api } from '../context/api';

export async function getProfile() {
  try {
    const { data } = await api.get('/api/v1/user/profile');
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getInterests() {
  try {
    // attach token explicitly if present to avoid AUTH errors when interceptor is not applied
    const headers = {};
    try {
      const t = localStorage.getItem('token');
      if (t) headers['Authorization'] = `Bearer ${t}`;
    } catch {
      // ignore storage errors
    }
    const { data } = await api.get('/api/v1/user/interests', { headers });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function addInterest(payload) {
  try {
    const { data } = await api.post('/api/v1/user/interests', payload);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function removeInterest(id) {
  try {
    const { data } = await api.delete(`/api/v1/user/interests/${id}`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateProfile(payload) {
  try {
    const { data } = await api.put('/api/v1/user/profile', payload);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
