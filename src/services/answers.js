/**
 * @deprecated Este archivo está obsoleto. Usar services/tests.js en su lugar.
 *
 * La nueva lógica del sistema de tests utiliza:
 * - tests.js: submitAnswer(testId, answer)
 * - El endpoint ahora devuelve { fullHistory, nextQuestion } o { fullHistory, message } con status 201
 * - Ya no se requiere userIdAnonimo, el sistema maneja automáticamente usuarios autenticados y anónimos
 */

import { api } from '../context/api';

// Servicio especializado para operaciones sobre respuestas (si backend lo separa)
// Actualmente los endpoints de respuestas están bajo /api/v1/tests/{id_test}/answer
// Mantenemos funciones wrapper por claridad de dominio.

export async function sendAnswer(testId, payload) {
  try {
    const { data } = await api.post(`/api/v1/tests/${testId}/answer`, payload);
    return data; // { nextQuestion? , progress? }
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function pauseTest(testId) {
  try {
    const { data } = await api.post(`/api/v1/tests/${testId}/pause`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function resumeTest(testId) {
  try {
    const { data } = await api.post(`/api/v1/tests/${testId}/resume`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function saveExit(testId) {
  try {
    const { data } = await api.post(`/api/v1/tests/${testId}/save-exit`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function abandon(testId) {
  try {
    const { data } = await api.post(`/api/v1/tests/${testId}/abandon`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
