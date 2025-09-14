import axios, { AxiosError } from 'axios';

// Usa variable de entorno (vite) permitiendo fallback para desarrollo
const BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || 'http://ovotest.mooo.com:5000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Set or remove the Authorization header for the shared axios instance.
 * Call with a token string to set the header, or with undefined/null to remove it.
 */
export function setAuthToken(token?: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Request interceptor: attach token from localStorage if present
api.interceptors.request.use(config => {
  try {
    const t = localStorage.getItem('token');
    if (t) {
      config.headers = config.headers || {};
      // preserve existing headers and set Authorization
      config.headers['Authorization'] = `Bearer ${t}`;
    }
  } catch {
    // ignore localStorage errors (e.g., SSR) and continue
  }
  return config;
});

// Response interceptor: if backend sends a renewed token in header 'new_token', persist it
api.interceptors.response.use(
  res => {
    try {
      const nt = res?.headers?.['new_token'];
      if (nt) {
        localStorage.setItem('token', nt);
        api.defaults.headers.common['Authorization'] = `Bearer ${nt}`;
      }
    } catch {
      /* ignore */
    }
    return res;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
      } catch {
        /* ignore */
      }
      delete api.defaults.headers.common['Authorization'];
      // Opcional: redirigir a login si no estamos ya allí
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login')
      ) {
        // guardar la ruta actual para volver luego
        const current = window.location.pathname + window.location.search;
        try {
          sessionStorage.setItem('post_login_redirect', current);
        } catch {
          /* ignore */
        }
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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

// TODO: Reemplazar endpoints simulados por los reales de tests cuando estén definidos
export const questionnaireApi = {
  async getQuestions(): Promise<Question[]> {
    const { data } = await api.get('/questions'); // placeholder
    return data;
  },
  async submitAnswers(
    userId: number,
    answers: Answer[]
  ): Promise<{ id: number }> {
    const { data } = await api.post('/answers', {
      // placeholder
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
    const { data } = await api.get('/recommendations'); // placeholder
    return data;
  },
};
// Tipado del error de la API
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

// Helper para obtener mensaje amigable
export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    const data = err.response?.data;
    return (
      (typeof data === 'object' && data && (data.message || data.error)) ||
      err.message ||
      'Error inesperado'
    );
  }
  if (err instanceof Error) return err.message;
  return 'Error desconocido';
}
// Nota: las llamadas a carreras ahora están en src/services/careers.js
