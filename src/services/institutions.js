import { api } from '../context/api';

export async function listInstitutions(params = {}) {
  try {
    const { data } = await api.get('/api/v1/institutions', { params });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getInstitution(id) {
  try {
    const { data } = await api.get(`/api/v1/institutions/${id}`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getRegistrationOptions() {
  try {
    const { data } = await api.get('/api/v1/institutions/registration/options');
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function registerInstitution(payload) {
  try {
    const { data } = await api.post(
      '/api/v1/institutions/registration',
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getMyCareers() {
  try {
    const { data } = await api.get('/api/v1/institutions/me/careers');
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getMyCareer(id) {
  try {
    const { data } = await api.get(`/api/v1/institutions/me/careers/${id}`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createMyCareer(payload) {
  try {
    const { data } = await api.post('/api/v1/institutions/me/careers', payload);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateMyCareer(id, payload) {
  try {
    const { data } = await api.put(
      `/api/v1/institutions/me/careers/${id}`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deleteMyCareer(id) {
  try {
    const { data } = await api.delete(`/api/v1/institutions/me/careers/${id}`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getMyCareerFaqs(careerId) {
  try {
    const { data } = await api.get(
      `/api/v1/institutions/me/careers/${careerId}/faqs`
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createMyCareerFaq(careerId, payload) {
  try {
    const { data } = await api.post(
      `/api/v1/institutions/me/careers/${careerId}/faqs`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateMyCareerFaq(careerId, faqId, payload) {
  try {
    const { data } = await api.put(
      `/api/v1/institutions/me/careers/${careerId}/faqs/${faqId}`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deleteMyCareerFaq(careerId, faqId) {
  try {
    const { data } = await api.delete(
      `/api/v1/institutions/me/careers/${careerId}/faqs/${faqId}`
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getMyCareerMaterials(careerId) {
  try {
    const { data } = await api.get(
      `/api/v1/institutions/me/careers/${careerId}/materials`
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createMyCareerMaterial(careerId, payload) {
  try {
    const { data } = await api.post(
      `/api/v1/institutions/me/careers/${careerId}/materials`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateMyCareerMaterial(careerId, materialId, payload) {
  try {
    const { data } = await api.put(
      `/api/v1/institutions/me/careers/${careerId}/materials/${materialId}`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deleteMyCareerMaterial(careerId, materialId) {
  try {
    const { data } = await api.delete(
      `/api/v1/institutions/me/careers/${careerId}/materials/${materialId}`
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getMyCareerAptitudes(careerId) {
  try {
    const { data } = await api.get(
      `/api/v1/institutions/me/careers/${careerId}/aptitudes`
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function addMyCareerAptitude(careerId, payload) {
  try {
    const { data } = await api.post(
      `/api/v1/institutions/me/careers/${careerId}/aptitudes`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function removeMyCareerAptitude(careerId, aptitudeId) {
  try {
    const { data } = await api.delete(
      `/api/v1/institutions/me/careers/${careerId}/aptitudes/${aptitudeId}`
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// Catalog functions for institutions
export async function getCareerModalities(params = {}) {
  try {
    const { data } = await api.get('/api/v1/admin/catalog/career-modalities', {
      params,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getCareerStates(params = {}) {
  try {
    const { data } = await api.get('/api/v1/admin/catalog/career-states', {
      params,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
