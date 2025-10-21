declare module '../../services/careers' {
  export interface Carrera {
    id: string | number;
    nombre: string;
    instituciones: string[];
  }
  export function listCareers(
    params?: Record<string, unknown>
  ): Promise<Carrera[]>;
}
