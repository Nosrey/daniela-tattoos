'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button, Card, Input } from '@/components/ui';
import { apiClient } from '@/lib/api';
import type { Tattoo, Category } from '@/types';

export default function AdminGalleryPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  const [tattoos, setTattoos] = useState<Tattoo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingTattoos, setLoadingTattoos] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Proteger la ruta
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !isAdmin) return;

      try {
        setLoadingTattoos(true);
        
        const filters = {
          ...(selectedCategory && { category: selectedCategory }),
          ...(searchQuery && { search: searchQuery }),
          limit: 50,
        };

        const [tattoosResponse, categoriesResponse] = await Promise.all([
          apiClient.getTattoos(filters),
          apiClient.getCategories(),
        ]);

        setTattoos(tattoosResponse.data?.tattoos || []);
        setCategories(categoriesResponse);
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingTattoos(false);
      }
    };

    loadData();
  }, [isAuthenticated, isAdmin, selectedCategory, searchQuery]);

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La búsqueda se hace automáticamente por el useEffect
  };

  // Toggle featured
  const toggleFeatured = async (tattoo: Tattoo) => {
    try {
      await apiClient.updateTattoo({
        _id: tattoo._id,
        isFeatured: !tattoo.isFeatured,
      });

      setTattoos(prev => prev.map(t => 
        t._id === tattoo._id 
          ? { ...t, isFeatured: !t.isFeatured }
          : t
      ));
    } catch (error) {
      console.error('Error updating tattoo:', error);
    }
  };

  if (isLoading) {
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

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Galería</h1>
            <p className="text-gray-600">Vista general de todos tus tatuajes</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <Button
              onClick={() => router.push('/admin/tattoos/new')}
              className="flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Tatuaje
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Buscar tatuajes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="primary">
                Buscar
              </Button>
            </form>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 text-sm rounded-lg border ${
                  !selectedCategory 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todas las categorías
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`px-4 py-2 text-sm rounded-lg border flex items-center ${
                    selectedCategory === category._id
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category.icon && <span className="mr-2">{category.icon}</span>}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Gallery Content */}
        {loadingTattoos ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : tattoos.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron tatuajes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando tu primer tatuaje al portafolio.
            </p>
            <Button
              onClick={() => router.push('/admin/tattoos/new')}
              className="mt-4"
            >
              Crear Tatuaje
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {tattoos.map((tattoo) => (
              <motion.div
                key={tattoo._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {viewMode === 'grid' ? (
                    // Grid View
                    <div className="relative">
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={tattoo.images[0]?.url}
                          alt={tattoo.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          {tattoo.isFeatured && (
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                              ★
                            </span>
                          )}
                          {!tattoo.isPublished && (
                            <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">
                              Borrador
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 truncate">{tattoo.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{tattoo.category.name}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>{tattoo.views} views</span>
                            <span>{tattoo.likes} likes</span>
                          </div>
                          <button
                            onClick={() => toggleFeatured(tattoo)}
                            className={`p-1 rounded ${
                              tattoo.isFeatured 
                                ? 'text-yellow-500 hover:text-yellow-600' 
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            ★
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // List View
                    <div className="flex items-center p-4 space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                        <img
                          src={tattoo.images[0]?.url}
                          alt={tattoo.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{tattoo.title}</h3>
                        <p className="text-sm text-gray-500">{tattoo.category.name}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{tattoo.views} views</span>
                          <span>{tattoo.likes} likes</span>
                          <span>{tattoo.style}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {tattoo.isFeatured && (
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                            ★
                          </span>
                        )}
                        {!tattoo.isPublished && (
                          <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">
                            Borrador
                          </span>
                        )}
                        <button
                          onClick={() => toggleFeatured(tattoo)}
                          className={`p-1 rounded ${
                            tattoo.isFeatured 
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          ★
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 