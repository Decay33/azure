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
        headers: {
          'Cache-Control': 'no-cache',
          Accept: 'application/json',
        },
      });

      if (!response.ok || response.type === 'opaqueredirect' || response.redirected) {
        setUser(null);
        return;
      }

      const raw = await response.text();

      if (!raw) {
        setUser(null);
        return;
      }

      try {
        const data = JSON.parse(raw);
        setUser(data?.clientPrincipal ?? null);
      } catch (parseError) {
        console.warn('Auth response was not JSON, treating as anonymous user.');
        setUser(null);
      }
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


