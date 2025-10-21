import { createContext } from 'react';

export interface AuthUser {
  grupos: string[];
  permisos: string[];
  usuario: {
    apellido: string;
    dni: number;
    fechaNac: string;
    id: number;
    idGenero: number;
    mail: string;
    nombre: string;
  };
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
