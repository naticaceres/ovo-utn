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
    const { data } = await api.get('/api/v1/user/interests');
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
