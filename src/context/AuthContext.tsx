'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: 'customer' | 'admin') => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'usr-demo-01',
  name: 'Camila Valmont',
  email: 'camila@aurelia.com',
  role: 'customer',
  phone: '+34 622 110 998',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_USER);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aurelia_auth_user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading auth user', e);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (user) {
        localStorage.setItem('aurelia_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('aurelia_auth_user');
      }
    } catch (e) {
      console.error('Error saving auth user', e);
    }
  }, [user, isHydrated]);

  const login = async (email: string) => {
    const isAdminUser = email.toLowerCase().includes('admin') || email.toLowerCase() === 'admin@aurelia.com';
    const loggedUser: User = {
      id: `usr-${Date.now()}`,
      name: isAdminUser ? 'Director Atelier (Admin)' : (email.split('@')[0] || 'Cliente'),
      email,
      role: isAdminUser ? 'admin' : 'customer',
      phone: '+34 600 000 000',
    };
    setUser(loggedUser);
    return { success: true };
  };

  const register = async (name: string, email: string) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'customer',
      phone: '',
    };
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: 'customer' | 'admin') => {
    if (!user) {
      setUser({
        id: `usr-${Date.now()}`,
        name: role === 'admin' ? 'Administrador Aurelia' : 'Cliente Aurelia',
        email: role === 'admin' ? 'admin@aurelia.com' : 'cliente@aurelia.com',
        role,
      });
      return;
    }
    setUser({ ...user, role });
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        switchRole,
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
