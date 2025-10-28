import { api } from '../context/api';

export async function loginGoogle(id_token) {
  try {
    const { data } = await api.post('/api/v1/auth/google', { id_token });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function me(token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get('/api/v1/auth/me', { headers });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function register(payload) {
  try {
    const { data } = await api.post('/api/v1/auth/register', payload);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function registerGoogle(payload) {
  try {
    const { data } = await api.post('/api/v1/auth/register/google', payload);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function deactivate(token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post('/api/v1/auth/deactivate', {}, { headers });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function forgotPassword(email) {
  try {
    const { data } = await api.post('/api/v1/auth/password/forgot', { email });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function validatePasswordToken(token) {
  try {
    const { data } = await api.get(`/api/v1/auth/password/validate`, {
      params: { token },
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function resetPassword(payload) {
  try {
    const { data } = await api.post('/api/v1/auth/password/reset', payload);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function changePassword(oldPassword, newPassword) {
  try {
    const { data } = await api.post('/api/v1/auth/password/change', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
