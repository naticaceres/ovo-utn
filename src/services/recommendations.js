import { api } from '../context/api';

// Servicio para obtener recomendaciones tras finalizar un test.
// Asumimos que existe un endpoint público/controlado para ver resultado de un test
// GET /api/v1/user/tests/{id_test}/result (según ENDPOINTS.md)

export async function getTestResult(testId) {
  try {
    const { data } = await api.get(`/api/v1/user/tests/${testId}/result`);
    return data; // puede incluir puntuaciones y lista de recomendaciones
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

// Helper para extraer sólo recomendaciones si la estructura viene envuelta.
export async function getRecommendationsFromTest(testId) {
  const result = await getTestResult(testId);
  if (!result) return [];
  if (Array.isArray(result)) return result;
  return (
    result.recommendations ||
    result.recomendaciones ||
    result.data?.recommendations ||
    []
  );
}
