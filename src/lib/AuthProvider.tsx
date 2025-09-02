import { useEffect, useState } from 'react';
import { AuthContext } from './auth-context';
import type { AuthUser } from './auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (user: AuthUser) => {
    setUser(user);
    sessionStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
