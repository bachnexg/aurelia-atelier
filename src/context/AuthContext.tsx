'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; message?: string; role?: 'customer' | 'admin' }>;
  register: (
    name: string,
    email: string,
    pass: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verify server-side HttpOnly session cookie on load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Clear any legacy insecure localStorage auth keys
        localStorage.removeItem('aurelia_auth_user');

        const res = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await res.json();
        if (mounted && data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (e) {
        console.error('Error verifying session:', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Credenciales inválidas.',
        };
      }

      setUser(data.user);
      return {
        success: true,
        role: data.user.role,
      };
    } catch {
      return {
        success: false,
        message: 'Error de conexión con el servidor de autenticación.',
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'No se pudo completar el registro.',
        };
      }

      setUser(data.user);
      return { success: true };
    } catch {
      return {
        success: false,
        message: 'Error de red al registrar la cuenta.',
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Error logging out:', e);
    } finally {
      localStorage.removeItem('aurelia_auth_user');
      setUser(null);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    // Never allow client-side role escalation via updateProfile
    const { role: _ignoredRole, ...safeData } = data;
    void _ignoredRole;
    setUser({ ...user, ...safeData });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
