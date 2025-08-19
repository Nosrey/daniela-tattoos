'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button } from '@/components/ui';
import { apiClient } from '@/lib/api';
import type { Tattoo, Category, User } from '@/types';

interface DashboardStats {
  tattoos: {
    total: number;
    published: number;
    featured: number;
    drafts: number;
    new?: number;
  };
  categories: {
    total: number;
    active: number;
    distribution?: any[];
  };
  views: {
    total: number;
    thisMonth: number;
  };
  likes: {
    total: number;
    thisMonth: number;
  };
  popular?: Tattoo[];
  mostViewed?: Tattoo[];
  activity?: {
    id: string;
    type: 'tattoo_created' | 'tattoo_updated' | 'category_created';
    title: string;
    description: string;
    createdAt: Date;
  }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Proteger la ruta
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated || !isAdmin) return;

      try {
        setLoadingStats(true);
        
        // Cargar estadísticas en tiempo real
        const statsData = await apiClient.getTattooStats();
        
        // Cargar categorías
        const categoriesResponse = await apiClient.getCategories();
        
        // Construir el objeto de estadísticas
        const dashboardStats: DashboardStats = {
          tattoos: {
            total: statsData.tattoos.total,
            published: statsData.tattoos.published,
            featured: statsData.tattoos.featured,
            drafts: statsData.tattoos.drafts,
            new: statsData.tattoos.new
          },
          categories: {
            total: categoriesResponse.length || 0,
            active: categoriesResponse.filter(cat => cat.isActive).length || 0,
            distribution: statsData.categories.distribution
          },
          views: {
            total: statsData.views.total,
            thisMonth: statsData.views.thisMonth,
          },
          likes: {
            total: statsData.likes.total,
            thisMonth: statsData.likes.thisMonth,
          },
          popular: statsData.popular,
          mostViewed: statsData.mostViewed,
          activity: statsData.activity
        };

        setStats(dashboardStats);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback a datos simulados si hay un error
        const mockStats: DashboardStats = {
          tattoos: {
            total: 0,
            published: 0,
            featured: 0,
            drafts: 0,
          },
          categories: {
            total: 0,
            active: 0,
          },
          views: {
            total: 0,
            thisMonth: 0,
          },
          likes: {
            total: 0,
            thisMonth: 0,
          },
        };
        setStats(mockStats);
      } finally {
        setLoadingStats(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, isAdmin]);

  if (isLoading || loadingStats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const StatCard = ({ title, value, subtitle, icon, color }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Resumen de la actividad de tu portafolio de tatuajes
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              title="Total de Tatuajes"
              value={stats.tattoos.total}
              subtitle={`${stats.tattoos.published} publicados`}
              color="bg-blue-100 text-blue-600"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            
            <StatCard
              title="Categorías"
              value={stats.categories.total}
              subtitle={`${stats.categories.active} activas`}
              color="bg-green-100 text-green-600"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            />
            
            <StatCard
              title="Visualizaciones"
              value={stats.views.total.toLocaleString()}
              subtitle={`+${stats.views.thisMonth} este mes`}
              color="bg-purple-100 text-purple-600"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            />
            
            <StatCard
              title="Me Gusta"
              value={stats.likes.total}
              subtitle={`+${stats.likes.thisMonth} este mes`}
              color="bg-red-100 text-red-600"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tatuajes Recientes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tatuajes Más Populares
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin/tattoos')}
                >
                  Ver todos
                </Button>
              </div>
              
              <div className="space-y-4">
                {stats && stats.popular && stats.popular.length > 0 ? (
                  stats.popular.slice(0, 5).map((tattoo) => (
                    <div key={tattoo._id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        {tattoo.images[0] && (
                          <img
                            src={tattoo.images[0].url}
                            alt={tattoo.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {tattoo.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tattoo.category.name} • {tattoo.style}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>{tattoo.views} vistas</span>
                        <span>•</span>
                        <span>{tattoo.likes} likes</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay datos de popularidad para mostrar.
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Actividad Reciente */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actividad Reciente
              </h2>
              
              <div className="space-y-4">
                {stats?.activity && stats.activity.length > 0 ? (
                  stats.activity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay actividad reciente
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Acciones Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="primary"
                onClick={() => router.push('/admin/tattoos/new')}
                className="flex items-center justify-center p-4 h-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Tatuaje
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/admin/categories')}
                className="flex items-center justify-center p-4 h-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Gestionar Categorías
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/gallery')}
                className="flex items-center justify-center p-4 h-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Galería Pública
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/admin/settings')}
                className="flex items-center justify-center p-4 h-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuración
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
} 