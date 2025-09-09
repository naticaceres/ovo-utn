import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://ovotest.mooo.com:5000',
  headers: { 'Content-Type': 'application/json' },
});

export type User = {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'estudiante' | 'guest' | 'institucion';
};
export type AuthPayload = { correo: string; contrasena: string; name?: string };

export const authApi = {
  async login(payload: AuthPayload): Promise<User> {
    // POST /api/v1/auth/login con correo y contrasena
    const { data } = await api.post('/api/v1/auth/login', {
      correo: payload.correo,
      contrasena: payload.contrasena,
    });
    return data as User;
  },
  // Puedes actualizar signup si el backend lo requiere
  async signup(payload: AuthPayload): Promise<User> {
    // ...existing code...
    const { data } = await api.post(`/users`, payload);
    return data as User;
  },
};

export type Question = { id: number; text: string; dimension: string };
export type Answer = { questionId: number; value: number };

export const questionnaireApi = {
  async getQuestions(): Promise<Question[]> {
    const { data } = await api.get('/questions');
    return data;
  },
  async submitAnswers(
    userId: number,
    answers: Answer[]
  ): Promise<{ id: number }> {
    const { data } = await api.post('/answers', {
      userId,
      answers,
      createdAt: new Date().toISOString(),
    });
    return data;
  },
};

export type Recommendation = {
  id: number;
  career: string;
  university: string;
  link: string;
};

export const resultsApi = {
  async getRecommendations(): Promise<Recommendation[]> {
    const { data } = await api.get('/recommendations');
    return data;
  },
};
// Nota: las llamadas a carreras ahora están en src/services/careers.js
