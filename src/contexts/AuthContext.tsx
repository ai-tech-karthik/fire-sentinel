import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '@/services/api';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        if (authApi.isAuthenticated()) {
          const data = await authApi.getCurrentUser();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authApi.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      setUser(data.user);
      toast.success('Logged in successfully');
      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Login failed');
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const data = await authApi.register(email, password, name);
      setUser(data.user);
      toast.success('Account created successfully');
      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Registration failed');
      return { error: err };
    }
  };

  const signOut = async () => {
    authApi.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    try {
      if (authApi.isAuthenticated()) {
        const data = await authApi.getCurrentUser();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
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
