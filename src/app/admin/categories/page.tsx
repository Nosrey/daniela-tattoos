'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button, Card, Modal } from '@/components/ui';
import { apiClient } from '@/lib/api';
import type { Category, CreateCategoryData } from '@/types';
import { CategoryForm } from '@/components/admin/CategoryForm';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Proteger la ruta
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      if (!isAuthenticated || !isAdmin) return;

      try {
        setLoadingCategories(true);
        const response = await apiClient.getCategories();
        setCategories(response);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isAuthenticated && isAdmin) {
    loadCategories();
    }
  }, [isAuthenticated, isAdmin]);

  const openCreateModal = () => {
    setFormError(null);
    setShowCreateModal(true);
  };

  const openEditModal = (category: Category) => {
    setFormError(null);
    setEditingCategory(category);
  };

  // Crear nueva categoría
  const handleCreateCategory = async (data: Partial<CreateCategoryData>) => {
    setIsSaving(true);
    setFormError(null);

    const payload = { ...data };
    if (payload.image && !payload.image.url) {
      delete payload.image;
    }
    
    try {
      const created = await apiClient.createCategory(payload);
      setCategories(prev => [...prev, created]);
      setShowCreateModal(false);
    } catch (error: any) {
      console.error('Error creating category:', error);
      const message = error.response?.data?.message || error.message || 'Ocurrió un error inesperado.';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Actualizar categoría
  const handleUpdateCategory = async (data: Partial<CreateCategoryData>) => {
    if (!editingCategory) return;
    
    setIsSaving(true);
    setFormError(null);

    const payload = { ...data };
    if (payload.image && !payload.image.url) {
      delete payload.image;
    }

    try {
      const updated = await apiClient.updateCategory({
        _id: editingCategory._id,
        ...payload,
      });
      setCategories(prev => prev.map(c => c._id === updated._id ? updated : c));
      setEditingCategory(null);
    } catch (error: any) {
      console.error('Error updating category:', error);
      const message = error.response?.data?.message || error.message || 'Ocurrió un error inesperado.';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsSaving(true);
    try {
      await apiClient.deleteCategory(categoryToDelete._id);
      setCategories(prev => prev.filter(c => c._id !== categoryToDelete._id));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle activo/inactivo
  const toggleActive = async (category: Category) => {
    try {
      await apiClient.updateCategory({
        _id: category._id,
        isActive: !category.isActive,
      });

      setCategories(prev => prev.map(c => 
        c._id === category._id 
          ? { ...c, isActive: !c.isActive }
          : c
      ));
    } catch (error) {
      console.error('Error updating category state:', error);
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
            <p className="text-gray-600">Organiza tu portafolio por categorías</p>
          </div>
          <Button
            onClick={openCreateModal}
            className="flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Categoría
          </Button>
        </div>

        {/* Categories Grid */}
        {loadingCategories ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      {category.image?.url ? (
                        <img src={category.image.url} alt={category.name} className="ml-2 w-6 h-6 object-contain" />
                      ) : category.icon ? (
                        <span className="ml-2 text-xl">{category.icon}</span>
                      ) : null}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleActive(category)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          category.isActive 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300'
                        }`}
                      >
                        {category.isActive && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.tattooCount || 0} tatuajes
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setCategoryToDelete(category);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Category Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Crear Nueva Categoría"
        >
          <CategoryForm
            onSubmit={handleCreateCategory}
            onCancel={() => setShowCreateModal(false)}
            isSaving={isSaving}
            submitButtonText="Crear"
            error={formError}
          />
        </Modal>

        {/* Edit Category Modal */}
        {editingCategory && (
          <Modal
            isOpen={!!editingCategory}
            onClose={() => setEditingCategory(null)}
            title="Editar Categoría"
          >
            <CategoryForm
              initialData={editingCategory}
              onSubmit={handleUpdateCategory}
              onCancel={() => setEditingCategory(null)}
              isSaving={isSaving}
              submitButtonText="Guardar Cambios"
              error={formError}
            />
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmar Eliminación"
        >
          <div>
            <p className="text-gray-700">
              ¿Estás seguro de que quieres eliminar la categoría <strong>{categoryToDelete?.name}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteCategory}
                disabled={isSaving}
              >
                {isSaving ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
} 