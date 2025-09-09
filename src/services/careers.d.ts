export interface Carrera {
  id: string | number;
  nombre: string;
  instituciones: string[];
}

export function listCareers(
  params?: Record<string, unknown>
): Promise<Carrera[]>;
export function searchCareers(query: string): Promise<Carrera[]>;
export function getCareerInstitutions(
  careerId: string | number
): Promise<unknown>;
export function getCareerInstitution(
  careerId: string | number,
  institutionId: string | number
): Promise<unknown>;
export function getCareer(careerId: string | number): Promise<Carrera>;
export function setCareerInterest(careerId: string | number): Promise<unknown>;
