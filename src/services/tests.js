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
 * Obtiene el estado actual de un test
 * Permite verificar si un test está activo o completado
 * @param {number} testId - ID del test
 * @returns {Promise} { idEstadoTest, nombreEstadoTest }
 * idEstadoTest: 1 = Activo, 2 = Completado
 */
export async function getTestStatus(testId) {
  try {
    const { data } = await api.get(`/api/v1/tests/${testId}/status`);
    // Mapear la respuesta del backend a un formato más amigable
    return {
      idEstadoTest: data.idEstadoTest,
      nombreEstadoTest: data.nombreEstadoTest,
      status: data.idEstadoTest === 1 ? 'in_progress' : 'completed',
      testId: testId,
    };
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

/**
 * Obtiene el historial de conversación de un test en progreso
 * Permite recuperar la conversación completa para continuar un test
 * @param {number} testId - ID del test
 * @returns {Promise} { fullHistory } - Array de mensajes del historial
 */
export async function getTestHistory(testId) {
  try {
    const { data } = await api.get(`/api/v1/tests/${testId}/history`);

    // El backend devuelve: { "HistorialPreguntas": "[\"...\", \"...\"]" }
    // Necesitamos parsear el string JSON para obtener el array
    if (data.HistorialPreguntas) {
      const historyArray = JSON.parse(data.HistorialPreguntas);

      // Convertir el array de strings al formato esperado
      const fullHistory = historyArray.map(msg => {
        // Cada mensaje viene como: "Asistente: texto" o "Usuario: texto"
        if (msg.startsWith('Asistente:')) {
          return {
            role: 'assistant',
            content: msg.replace('Asistente: ', '').trim(),
          };
        } else if (msg.startsWith('Usuario:')) {
          return {
            role: 'user',
            content: msg.replace('Usuario: ', '').trim(),
          };
        }
        // Fallback si no tiene prefijo
        return {
          role: 'assistant',
          content: msg,
        };
      });

      return { fullHistory };
    }

    return { fullHistory: [] };
  } catch (error) {
    console.warn('No se pudo obtener el historial del test:', error);
    return { fullHistory: [] };
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
