import { createContext } from 'react';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'estudiante' | 'guest' | 'institucion';
  groups?: string[]; // Agregamos los grupos del usuario
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
