'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import { config } from '@/lib/config';
import type { 
  AuthContextType, 
  User, 
  LoginData, 
  RegisterData, 
  UpdateProfileData, 
  ChangePasswordData 
} from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar token almacenado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const storedToken = localStorage.getItem(config.auth.tokenKey);
        
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        setToken(storedToken);
        
        // Verificar si el token es válido obteniendo el perfil
        const userData = await apiClient.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Error checking auth:', error);
        // Token inválido, limpiar storage
        localStorage.removeItem(config.auth.tokenKey);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await apiClient.login({ email, password });
      
      setUser(result.user);
      setToken(result.token);
      
      // Redirigir según el rol
      if (result.user.role === 'admin') {
        window.location.href = config.auth.redirectAfterLogin;
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await apiClient.register(userData);
      
      setUser(result.user);
      setToken(result.token);
      
      // Redirigir a home después del registro
      window.location.href = '/';
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    apiClient.logout();
    setUser(null);
    setToken(null);
    window.location.href = config.auth.redirectAfterLogout;
  };

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    try {
      setIsLoading(true);
      const updatedUser = await apiClient.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.changePassword(data);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; 