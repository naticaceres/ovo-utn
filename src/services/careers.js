import { api } from '../context/api';

export async function listCareers(params = {}) {
  try {
    const { data } = await api.get('/api/v1/careers', { params });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function searchCareers(query) {
  try {
    const { data } = await api.get('/api/v1/careers', {
      params: { search: query },
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getCareerInstitutions(careerId) {
  try {
    const { data } = await api.get(`/api/v1/careers/${careerId}/institutions`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getCareerInstitution(careerId, institutionId) {
  try {
    const { data } = await api.get(
      `/api/v1/careers/${careerId}/institutions/${institutionId}`
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getCareer(careerId) {
  try {
    const { data } = await api.get(`/api/v1/careers/${careerId}`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function setCareerInterest(careerId) {
  try {
    const { data } = await api.post(`/api/v1/careers/${careerId}/interest`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
