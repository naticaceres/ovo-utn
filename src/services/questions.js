/**
 * @deprecated Este archivo está obsoleto. Usar services/tests.js en su lugar.
 *
 * La nueva lógica del sistema de tests utiliza:
 * - tests.js: startTest(), submitAnswer(), getTestResults(), getUserTests()
 * - api.ts: Funciones y tipos TypeScript actualizados
 *
 * El flujo nuevo es:
 * 1. startTest() -> devuelve { chatbot_response, fullHistory, idTest }
 * 2. submitAnswer(testId, answer) -> devuelve { fullHistory, nextQuestion } o status 201 cuando termina
 * 3. getTestResults(testId) -> devuelve { aptitudesObtenidas, carrerasRecomendadas, fullHistory, testId }
 * 4. getUserTests() -> devuelve array de tests históricos del usuario
 */

import { api } from '../context/api';

// Servicio para obtener preguntas del test vocacional.
// Si el backend define un endpoint específico diferente, ajustar aquí.
// Suposición: backend expone /api/v1/tests/start que devuelve { idTest, preguntas: [...] }
// Proveemos función separada para iniciar y para solo listar preguntas si ya existe un test activo.

export async function startQuestionnaire(payload = {}) {
  try {
    const { data } = await api.post('/api/v1/tests/start', payload);
    return data; // debería incluir idTest y preguntas
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getTestProgress(testId) {
  try {
    const { data } = await api.get(`/api/v1/tests/${testId}/progress`);
    return data; // { answered, total, nextQuestion? }
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function submitAnswer(testId, answerPayload) {
  try {
    const { data } = await api.post(
      `/api/v1/tests/${testId}/answer`,
      answerPayload
    );
    return data; // next question or status
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function finishTest(testId) {
  try {
    const { data } = await api.post(`/api/v1/tests/${testId}/finish`);
    return data; // final result summary id perhaps
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
