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
              if (active) {
                // Debug: ver qué datos están llegando
                console.log('Parsed user data from localStorage:', parsed);

                // Extraer grupos del usuario
                const groups = parsed.grupos || parsed.groups || [];

                // Extraer el nombre con múltiples intentos
                const name =
                  parsed.name ||
                  parsed.nombre ||
                  parsed.firstName ||
                  parsed.first_name ||
                  parsed.fullName ||
                  parsed.full_name ||
                  parsed.displayName ||
                  parsed.usuario?.nombre ||
                  parsed.usuario?.name ||
                  '';

                const authUser: AuthUser = {
                  id: parsed.id ?? parsed.userId ?? parsed._id ?? 0,
                  email: parsed.email ?? parsed.correo ?? parsed.username ?? '',
                  name: name,
                  role: (parsed.role ??
                    parsed.rol ??
                    'estudiante') as AuthUser['role'],
                  groups: Array.isArray(groups) ? groups : [],
                };

                console.log('Mapped AuthUser:', authUser);
                setUser(authUser);
              }
            } catch {
              /* ignore */
            }
          }
          // Validación silenciosa del token
          try {
            const { data } = await api.get('/api/v1/auth/me');
            if (active && data) {
              // Debug: ver qué datos están llegando del API
              console.log('API response data:', data);

              // Extraer grupos del data si están disponibles
              const groups = data.grupos || data.groups || [];

              // Extraer el nombre con múltiples intentos
              const name =
                data.name ||
                data.nombre ||
                data.firstName ||
                data.first_name ||
                data.fullName ||
                data.full_name ||
                data.displayName ||
                data.usuario?.nombre ||
                data.usuario?.name ||
                '';

              const authUser: AuthUser = {
                id: data.id ?? data.userId ?? data._id ?? 0,
                email: data.email ?? data.correo ?? data.username ?? '',
                name: name,
                role: (data.role ??
                  data.rol ??
                  'estudiante') as AuthUser['role'],
                groups: Array.isArray(groups) ? groups : [],
              };

              console.log('Mapped AuthUser from API:', authUser);
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
