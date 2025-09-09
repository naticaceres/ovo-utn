import { api } from '../context/api';

export async function startTest(payload) {
  try {
    const { data } = await api.post('/api/v1/tests/start', payload);
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

export async function submitAnswer(testId, payload) {
  try {
    const { data } = await api.post(`/api/v1/tests/${testId}/answer`, payload);
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
