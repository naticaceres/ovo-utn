import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

export type User = { id: number; email: string; name: string };
export type AuthPayload = { email: string; password: string; name?: string };

export const authApi = {
  async login(payload: AuthPayload): Promise<User | null> {
    const { data } = await api.get(`/users`, {
      params: { email: payload.email },
    });
    const user = (data as User[])[0];
    if (user && user.password === payload.password) {
      return { id: user.id, email: user.email, name: user.name };
    }
    return null;
  },
  async signup(payload: AuthPayload): Promise<User> {
    const { data } = await api.post(`/users`, payload);
    return { id: data.id, email: data.email, name: data.name };
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
