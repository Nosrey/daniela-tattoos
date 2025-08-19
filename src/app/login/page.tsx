'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card } from '@/components/ui';
import { config } from '@/lib/config';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginError {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();
  
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name as keyof LoginError]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginError = {};

    if (!form.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!form.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (form.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(form.email, form.password);
    } catch (error: any) {
      console.error('Error en login:', error);
      
      if (error.response?.status === 401) {
        setErrors({ general: 'Email o contraseña incorrectos' });
      } else if (error.response?.status === 403) {
        setErrors({ general: 'No tienes permisos para acceder' });
      } else {
        setErrors({ general: 'Error en el servidor. Intenta de nuevo.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {config.app.name}
          </h1>
          <h2 className="mt-6 text-xl font-semibold text-gray-600">
            Panel de Administración
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Inicia sesión para acceder al panel de control
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {errors.general}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="admin@danielatattoos.com"
              value={form.email}
              onChange={handleInputChange}
              error={errors.email}
              required
              disabled={isSubmitting}
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleInputChange}
              error={errors.password}
              required
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              ¿Olvidaste tu contraseña?{' '}
              <button className="text-black hover:underline">
                Contacta al administrador
              </button>
            </p>
          </div>
        </Card>

        {/* Demo credentials */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Credenciales de Prueba:
            </h3>
            <p className="text-xs text-blue-600">
              Email: admin@danielatattoos.com<br />
              Contraseña: admin123
            </p>
          </Card>
        )}

        {/* Back to site */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Volver al sitio web
          </button>
        </div>
      </motion.div>
    </div>
  );
} 