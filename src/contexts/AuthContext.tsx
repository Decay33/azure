import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  userId: string;
  userDetails: string;
  identityProvider: string;
  userRoles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const response = await fetch('/.auth/me', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setUser(null);
        return;
      }

      const data = await response.json();
      setUser(data?.clientPrincipal ?? null);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    window.location.href = '/.auth/logout?post_logout_redirect_uri=/';
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


