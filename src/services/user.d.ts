export interface UserProfile {
  nombre?: string;
  apellido?: string;
  fechaNacimiento?: string;
  dni?: number;
  email?: string;
}

export function getProfile(): Promise<UserProfile>;
export function getInterests(): Promise<unknown>;
export function addInterest(payload: unknown): Promise<unknown>;
export function removeInterest(id: string | number): Promise<unknown>;
export function updateProfile(payload: UserProfile): Promise<UserProfile>;
