'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  full_name: string | null; // normalized from backend 'name' field
  role: string;
  phone: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: User | null; 
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await apiFetch('/auth/me');
      // Backend returns { user: { id, name, email, role } } — normalize 'name' → 'full_name'
      if (data?.user) {
        setUser({
          ...data.user,
          full_name: data.user.full_name ?? data.user.name ?? null,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signIn = async (email: string, password: string) => {
    try {
      await apiFetch('/auth/signin', { data: { email, password } });
      await fetchUser();
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await apiFetch('/auth/signup', { data: { email, password, full_name: fullName } });
      await fetchUser();
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Signup failed' };
    }
  };

  const signOut = async () => {
    try {
        await apiFetch('/auth/signout', { method: 'POST' });
    } catch (e) {
        // Ignore error on signout
    }
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, profile: user, isLoading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
