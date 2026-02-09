'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, AuthState, LoginCredentials, SignupCredentials } from '@/lib/auth-types';
import { authApi, type LoginResponse, type User as ApiUser } from '@/lib/api-client';

// Helper to convert API User type to auth User type
function toAuthUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    createdAt: new Date(apiUser.created_at),
  };
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is still valid by calling /me endpoint
          const currentUser = await authApi.getCurrentUser();
          setUser(toAuthUser(currentUser));
          setStatus('authenticated');
        } catch (err) {
          // Token is invalid or expired, clear storage
          // Also handles case when backend is down (HTTP 500)
          console.error('Auth check failed:', err);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setStatus('unauthenticated');
        }
      } else {
        setStatus('unauthenticated');
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null);
    try {
      const response: LoginResponse = await authApi.login(credentials);
      setUser(toAuthUser(response.user));
      setStatus('authenticated');
      // Token and user are already stored in api-client.ts
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setError(null);
    try {
      // Register the user
      const newUser = await authApi.register(credentials);

      // Auto-login after registration
      const loginResponse: LoginResponse = await authApi.login({
        email: credentials.email,
        password: credentials.password,
      });

      setUser(toAuthUser(loginResponse.user));
      setStatus('authenticated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      authApi.logout();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
      // Storage is already cleared in api-client.ts
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    status,
    login,
    signup,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
