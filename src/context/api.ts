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
    // Enriquecer el objeto de error con un mensaje normalizado si existe body
    const data = error.response?.data;
    if (data) {
      const code =
        (data as { errorCode?: string; code?: string } | undefined)
          ?.errorCode || (data as { code?: string } | undefined)?.code;
      const primary = data.message || data.error || undefined;
      const apiMessage = primary ? primary : code;
      if (apiMessage) {
        // Define propiedad no enumerable para no interferir con serialización por defecto
        Object.defineProperty(error, 'apiMessage', {
          value: apiMessage,
          enumerable: false,
          configurable: true,
          writable: true,
        });
      }
    }
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
      } catch {
        /* ignore */
      }
      delete api.defaults.headers.common['Authorization'];
      // Se eliminó el redirect automático. La UI debe manejar 401 mostrando login manualmente.
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
    const anyErr = err as AxiosError<ApiErrorResponse> & {
      apiMessage?: string;
    };
    if (anyErr.apiMessage) return anyErr.apiMessage;
    const data = anyErr.response?.data;
    // No se loguea en consola para evitar ruido en producción
    if (data instanceof Blob) {
      // intentar leer texto sincronamente no es posible; devolver mensaje genérico indicando descarga vacía
      return anyErr.message || 'Error inesperado';
    }
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (parsed && (parsed.message || parsed.error)) {
          return parsed.message || parsed.error;
        }
      } catch {
        const str = data as string;
        if (str.trim()) return str.trim();
      }
    }
    if (typeof data === 'object' && data) {
      const d = data as {
        message?: unknown;
        error?: unknown;
        errorCode?: unknown;
        code?: unknown;
        success?: unknown;
        ok?: unknown;
      };
      if (d.message && typeof d.message === 'string') return d.message;
      if (d.error && typeof d.error === 'string') return d.error;
      if (d.errorCode && typeof d.errorCode === 'string') return d.errorCode;
      if (d.code && typeof d.code === 'string') return d.code;
      if (
        (typeof d.success !== 'undefined' && !d.success) ||
        (typeof d.ok !== 'undefined' && !d.ok)
      ) {
        return 'Operación no completada';
      }
    }
    return anyErr.message || 'Error inesperado';
  }
  if (err instanceof Error) return err.message;
  // Si el servicio arrojó directamente response.data (objeto plano)
  if (err && typeof err === 'object') {
    const e = err as {
      message?: unknown;
      error?: unknown;
      errorCode?: unknown;
      code?: unknown;
    };
    if (typeof e.message === 'string') return e.message;
    if (typeof e.error === 'string') return e.error;
    if (typeof e.errorCode === 'string') return e.errorCode;
    if (typeof e.code === 'string') return e.code;
  }
  return 'Error desconocido';
}
// Nota: las llamadas a carreras ahora están en src/services/careers.js
