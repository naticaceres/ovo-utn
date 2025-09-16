import { api } from '../context/api';

export async function getCatalog(resource, params = {}) {
  try {
    const { data } = await api.get(`/api/v1/admin/catalog/${resource}`, {
      params,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getCatalogById(resource, id) {
  try {
    const { data } = await api.get(`/api/v1/admin/catalog/${resource}/${id}`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function createCatalog(resource, payload) {
  try {
    const { data } = await api.post(
      `/api/v1/admin/catalog/${resource}`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function updateCatalog(resource, id, payload) {
  try {
    const { data } = await api.put(
      `/api/v1/admin/catalog/${resource}/${id}`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deleteCatalog(resource, id) {
  try {
    const { data } = await api.delete(
      `/api/v1/admin/catalog/${resource}/${id}`
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
