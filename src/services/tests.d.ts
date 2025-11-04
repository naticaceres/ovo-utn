/**
 * Declaraciones de tipos para tests.js
 */

export interface Aptitud {
  id: number;
  nombre: string;
  valor?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface CarreraRecomendada {
  idCarrera?: number;
  id?: number;
  nombreCarrera?: string;
  nombre?: string;
  compatibilidad?: number;
  porcentaje?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface HistoryItem {
  role: string;
  content: string;
  timestamp?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Test {
  idTest?: number;
  id?: number;
  fechaCreacion?: string;
  createdAt?: string;
  created_at?: string;
  fecha?: string;
  carrerasRecomendadas?: CarreraRecomendada[];
  aptitudesObtenidas?: Aptitud[];
  fullHistory?: HistoryItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface TestResult {
  testId: number;
  aptitudesObtenidas: Aptitud[];
  carrerasRecomendadas: Array<{
    idCarrera: number;
    nombreCarrera: string;
    compatibilidad: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }>;
  fullHistory: HistoryItem[];
}

/**
 * Inicia un nuevo test vocacional
 */
export function startTest(): Promise<{
  chatbot_response: string;
  fullHistory: HistoryItem[];
  idTest: number;
}>;

/**
 * Obtiene el estado actual de un test
 */
export function getTestStatus(testId: number): Promise<{
  idEstadoTest: number;
  nombreEstadoTest: string;
  status: 'in_progress' | 'completed';
  testId: number;
}>;

/**
 * Obtiene el historial de conversación de un test
 */
export function getTestHistory(testId: number): Promise<{
  fullHistory: HistoryItem[];
}>;

/**
 * Envía una respuesta a una pregunta del test
 */
export function submitAnswer(
  testId: number,
  answer: string
): Promise<{
  data: {
    chatbot_response: string;
    fullHistory: HistoryItem[];
  };
  status: number;
}>;

/**
 * Obtiene los resultados de un test específico
 */
export function getTestResults(testId: number): Promise<TestResult>;

/**
 * Obtiene la lista de todos los tests realizados por el usuario autenticado
 */
export function getUserTests(): Promise<Test[]>;
