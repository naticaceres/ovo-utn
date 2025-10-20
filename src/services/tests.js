import { api } from '../context/api';

export async function startTest() {
  try {
    const { data } = await api.post('/api/v1/tests/start', {});
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function accessTest(testId, payload) {
  try {
    const { data } = await api.post(
      `/api/v1/user/tests/${testId}/access`,
      payload
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function restartTest() {
  try {
    const { data } = await api.post('/api/v1/user/tests/restart');
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function submitAnswer(chatId, answer, userIdAnonimo = null) {
  try {
    const payload = { answer };

    // Si hay userIdAnonimo, lo incluimos en el payload
    if (userIdAnonimo) {
      payload.userIdAnonimo = userIdAnonimo;
    }
    // Si no hay userIdAnonimo, el interceptor del api agregará automáticamente el token

    const { data } = await api.post(`/api/v1/tests/${chatId}/answer`, payload);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getProgress(testId) {
  try {
    const { data } = await api.get(`/api/v1/tests/${testId}/progress`);
    return data;
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

export async function abandonTest(testId) {
  try {
    const { data } = await api.post(`/api/v1/tests/${testId}/abandon`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function finishTest(testId) {
  try {
    const { data } = await api.post(`/api/v1/tests/${testId}/finish`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getTestResults(testId) {
  try {
    const payload = {};

    // Verificar si hay userIdAnonimo en localStorage
    const userIdAnonimo = localStorage.getItem('userIdAnonimo');
    if (userIdAnonimo) {
      payload.userIdAnonimo = userIdAnonimo;
    }
    // Si no hay userIdAnonimo, el interceptor del api agregará automáticamente el token

    const { data } = await api.request({
      method: 'GET',
      url: `/api/v1/tests/${testId}/results`,
      data: Object.keys(payload).length > 0 ? payload : {},
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
