import { api } from '../context/api';

/**
 * Inicia un nuevo test vocacional
 * Funciona tanto para usuarios autenticados (con Bearer token) como anónimos
 * @returns {Promise} { chatbot_response, fullHistory, idTest }
 */
export async function startTest() {
  try {
    const { data } = await api.post('/api/v1/tests/start', {});
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

/**
 * Envía una respuesta a una pregunta del test
 * @param {number} testId - ID del test en curso
 * @param {string} answer - Respuesta del usuario
 * @returns {Promise} { fullHistory, nextQuestion } o { fullHistory, message } si finalizó (201)
 */
export async function submitAnswer(testId, answer) {
  try {
    const payload = { answer };
    const response = await api.post(`/api/v1/tests/${testId}/answer`, payload);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

/**
 * Obtiene los resultados de un test específico
 * Si se proporciona el testId, asocia el test al usuario autenticado
 * ACCESO PÚBLICO: Disponible para todos los usuarios autenticados, sin restricciones de permisos
 * @param {number} testId - ID del test
 * @returns {Promise} { aptitudesObtenidas, carrerasRecomendadas, fullHistory, testId }
 */
export async function getTestResults(testId) {
  try {
    const { data } = await api.get(`/api/v1/tests/${testId}/results`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

/**
 * Obtiene la lista de todos los tests realizados por el usuario autenticado
 * ACCESO PÚBLICO: Disponible para todos los usuarios autenticados, sin restricciones de permisos
 * Requiere token de autenticación (Bearer token)
 * @returns {Promise} Array de tests con sus resultados
 */
export async function getUserTests() {
  try {
    const { data } = await api.get('/api/v1/user/tests');
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
