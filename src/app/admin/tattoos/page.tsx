'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button, Card, Input, Modal } from '@/components/ui';
import { apiClient } from '@/lib/api';
import type { Tattoo, Category, TattooFilters } from '@/types';

export default function AdminTattoosPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  const [tattoos, setTattoos] = useState<Tattoo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingTattoos, setLoadingTattoos] = useState(true);
  const [filters, setFilters] = useState<TattooFilters>({
    page: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTattoo, setSelectedTattoo] = useState<Tattoo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tattooToDelete, setTattooToDelete] = useState<Tattoo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        
        // Cargar tatuajes y categorías en paralelo
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
  }, [isAuthenticated, isAdmin, filters]);

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchQuery.trim() || undefined,
      page: 1,
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      page: 1,
      limit: 20,
    });
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

  // Toggle published
  const togglePublished = async (tattoo: Tattoo) => {
    try {
      await apiClient.updateTattoo({
        _id: tattoo._id,
        isPublished: !tattoo.isPublished,
      });

      setTattoos(prev => prev.map(t => 
        t._id === tattoo._id 
          ? { ...t, isPublished: !t.isPublished }
          : t
      ));
    } catch (error) {
      console.error('Error updating tattoo:', error);
    }
  };

  // Eliminar tatuaje
  const handleDeleteTattoo = async () => {
    if (!tattooToDelete) return;

    try {
      setIsDeleting(true);
      await apiClient.deleteTattoo(tattooToDelete._id);
      
      setTattoos(prev => prev.filter(t => t._id !== tattooToDelete._id));
      setShowDeleteModal(false);
      setTattooToDelete(null);
    } catch (error) {
      console.error('Error deleting tattoo:', error);
    } finally {
      setIsDeleting(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Tatuajes</h1>
            <p className="text-gray-600">Administra tu portafolio de tatuajes</p>
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

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant={!filters.category && !filters.featured && !filters.isPublished ? 'primary' : 'outline'}
                size="sm"
                onClick={clearFilters}
              >
                Todos
              </Button>
              
              <Button
                variant={filters.featured ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  featured: prev.featured ? undefined : true,
                  page: 1,
                }))}
              >
                Destacados
              </Button>

              <Button
                variant={filters.isPublished === true ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  isPublished: prev.isPublished === true ? undefined : true,
                  page: 1,
                }))}
              >
                Publicados
              </Button>

              <Button
                variant={filters.isPublished === false ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  isPublished: prev.isPublished === false ? undefined : false,
                  page: 1,
                }))}
              >
                Borradores
              </Button>

              {/* Categories */}
              {categories.map((category) => (
                <Button
                  key={category._id}
                  variant={filters.category === category._id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    category: prev.category === category._id ? undefined : category._id,
                    page: 1,
                  }))}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Results count */}
        {!loadingTattoos && (
          <div className="mb-6">
            <p className="text-gray-600">
              {tattoos.length > 0 
                ? `${tattoos.length} tatuaje${tattoos.length !== 1 ? 's' : ''} encontrado${tattoos.length !== 1 ? 's' : ''}`
                : 'No se encontraron tatuajes'
              }
            </p>
          </div>
        )}

        {/* Tattoos List */}
        {loadingTattoos ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : tattoos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {tattoos.map((tattoo, index) => (
              <motion.div
                key={tattoo._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                      {tattoo.images[0] && (
                        <img
                          src={tattoo.images[0].url}
                          alt={tattoo.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {tattoo.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {tattoo.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{tattoo.category.name}</span>
                            <span>•</span>
                            <span className="capitalize">{tattoo.style}</span>
                            <span>•</span>
                            <span>{tattoo.views} vistas</span>
                            <span>•</span>
                            <span>{tattoo.likes} likes</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Status badges */}
                          <div className="flex flex-col items-end space-y-1">
                            {tattoo.isFeatured && (
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                                Destacado
                              </span>
                            )}
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              tattoo.isPublished
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {tattoo.isPublished ? 'Publicado' : 'Borrador'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/tattoos/${tattoo._id}/edit`)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTattoo(tattoo)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setTattooToDelete(tattoo);
                              setShowDeleteModal(true);
                            }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant={tattoo.isFeatured ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => toggleFeatured(tattoo)}
                          >
                            {tattoo.isFeatured ? 'Quitar destacado' : 'Destacar'}
                          </Button>
                          
                          <Button
                            variant={tattoo.isPublished ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => togglePublished(tattoo)}
                          >
                            {tattoo.isPublished ? 'Despublicar' : 'Publicar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tatuajes</h3>
            <p className="text-gray-500 mb-4">Comienza agregando tu primer tatuaje al portafolio.</p>
            <Button onClick={() => router.push('/admin/tattoos/new')}>
              Crear Primer Tatuaje
            </Button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmar Eliminación"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro de que quieres eliminar el tatuaje "{tattooToDelete?.title}"?
            </p>
            <p className="text-sm text-red-600">
              Esta acción no se puede deshacer.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteTattoo}
                isLoading={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Tattoo Modal */}
        {selectedTattoo && (
          <Modal
            isOpen={!!selectedTattoo}
            onClose={() => setSelectedTattoo(null)}
            title={selectedTattoo.title}
          >
            <div className="space-y-4">
              {/* Image */}
              <div className="aspect-square w-full bg-gray-200 rounded-lg overflow-hidden">
                {selectedTattoo.images[0] && (
                  <img
                    src={selectedTattoo.images[0].url}
                    alt={selectedTattoo.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Descripción</h3>
                  <p className="text-gray-600">{selectedTattoo.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Categoría</h4>
                    <p className="text-gray-600">{selectedTattoo.category.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Estilo</h4>
                    <p className="text-gray-600 capitalize">{selectedTattoo.style}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Tamaño</h4>
                    <p className="text-gray-600 capitalize">{selectedTattoo.size}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Zona</h4>
                    <p className="text-gray-600 capitalize">{selectedTattoo.bodyPart}</p>
                  </div>
                </div>

                {selectedTattoo.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTattoo.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 text-sm rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{selectedTattoo.views} vistas</span>
                    <span>{selectedTattoo.likes} likes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedTattoo.isFeatured && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                        Destacado
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      selectedTattoo.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedTattoo.isPublished ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
} 