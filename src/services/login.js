import { api } from '../context/api';

export async function login(correo, contrasena) {
  try {
    const response = await api.post('/api/v1/auth/login', {
      correo,
      contrasena,
    });
    // si el backend devuelve token en header 'new_token', guardarlo
    try {
      const nt = response?.headers?.['new_token'];
      if (nt) localStorage.setItem('token', nt);
    } catch {
      // ignore storage errors
    }
    return response; // devolver la respuesta completa para que el caller lea headers si lo desea
  } catch (error) {
    // Puedes personalizar el manejo de errores
    // axios error shape may vary; preserve previous behavior
    throw error.response ? error.response.data : error;
  }
}

export async function forgotPassword(correo) {
  try {
    const response = await api.post('/api/v1/auth/password/forgot', {
      correo,
    });
    return response;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
