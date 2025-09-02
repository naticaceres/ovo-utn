import { createContext } from 'react';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'estudiante' | 'guest' | 'institucion';
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
