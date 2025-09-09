import axios from 'axios';

const API_URL = 'http://ovotest.mooo.com:5000/api/v1/auth/login';

export async function login(correo, contrasena) {
  try {
    const response = await axios.post(
      API_URL,
      {
        correo,
        contrasena,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.data;
  } catch (error) {
    // Puedes personalizar el manejo de errores
    throw error.response ? error.response.data : error;
  }
}
export function login(email: string, password: string): Promise<any>;