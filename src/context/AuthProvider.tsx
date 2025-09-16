import { useEffect, useState } from 'react';
import { AuthContext } from './auth-context';
import type { AuthUser } from './auth-context';
import { setAuthToken, api } from './api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setAuthToken(token);
          // Intentar restaurar user del storage primero
          const stored = localStorage.getItem('user');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (active) setUser(parsed);
            } catch {
              /* ignore */
            }
          }
          // Validación silenciosa del token
          try {
            const { data } = await api.get('/api/v1/auth/me');
            if (active && data) {
              const authUser: AuthUser = {
                id: data.id ?? data.userId ?? data._id ?? 0,
                email: data.email ?? data.correo ?? data.username ?? '',
                name: data.name ?? data.nombre ?? '',
                role: (data.role ??
                  data.rol ??
                  'estudiante') as AuthUser['role'],
              };
              setUser(authUser);
              localStorage.setItem('user', JSON.stringify(authUser));
            }
          } catch {
            // token inválido: limpiar
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setAuthToken(undefined);
            if (active) setUser(null);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = (user: AuthUser) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuthToken(undefined);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
}
