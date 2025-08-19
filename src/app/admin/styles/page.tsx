'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button, Card, Modal } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { Style, CreateStyleData, UpdateStyleData } from '@/types';
import { PlusIcon, TrashIcon, PencilIcon, MenuIcon } from '@heroicons/react/24/outline';
import StyleForm from '@/components/admin/StyleForm';
import { toast } from 'react-hot-toast';

export default function AdminStylesPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [styleToDelete, setStyleToDelete] = useState<Style | null>(null);

  const fetchStyles = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedStyles = await apiClient.getStyles();
      setStyles(fetchedStyles);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los estilos.');
      toast.error(err.message || 'No se pudieron cargar los estilos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchStyles();
    }
  }, [isAuthenticated, isAdmin, fetchStyles]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reorderedStyles = Array.from(styles);
    const [removed] = reorderedStyles.splice(result.source.index, 1);
    reorderedStyles.splice(result.destination.index, 0, removed);

    setStyles(reorderedStyles);

    const stylesToUpdate = reorderedStyles.map((style, index) => ({
      id: style._id,
      position: index,
    }));

    try {
      await apiClient.reorderStyles(stylesToUpdate);
      toast.success('Orden de estilos actualizado.');
    } catch (err: any) {
      setError(err.message || 'No se pudo reordenar los estilos.');
      toast.error(err.message || 'No se pudo reordenar los estilos.');
      fetchStyles(); // Revertir al estado anterior
    }
  };
  
  const handleSaveStyle = async (data: CreateStyleData | UpdateStyleData) => {
    try {
      if ('_id' in data && data._id) {
        await apiClient.updateStyle(data._id, data);
        toast.success('Estilo actualizado correctamente.');
      } else {
        await apiClient.createStyle(data);
        toast.success('Estilo creado correctamente.');
      }
      setIsModalOpen(false);
      fetchStyles();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el estilo.');
      toast.error(err.message || 'Error al guardar el estilo.');
    }
  };

  const openModal = (style: Style | null = null) => {
    setSelectedStyle(style);
    setIsModalOpen(true);
  };
  
  const confirmDelete = (style: Style) => {
    setStyleToDelete(style);
    setIsDeleting(true);
  };
  
  const handleDelete = async () => {
    if (!styleToDelete) return;
    try {
      await apiClient.deleteStyle(styleToDelete._id);
      toast.success(`Estilo "${styleToDelete.name}" eliminado.`);
      setIsDeleting(false);
      setStyleToDelete(null);
      fetchStyles();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el estilo.');
      toast.error(err.message || 'Error al eliminar el estilo.');
      setIsDeleting(false);
    }
  };

  if (loading) return <p>Cargando estilos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestionar Estilos</h1>
        <Button onClick={() => openModal()} icon={<PlusIcon className="h-5 w-5 mr-2" />}>
          Añadir Estilo
        </Button>
      </div>

      <Card>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="styles">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {styles.map((style, index) => (
                  <Draggable key={style._id} draggableId={style._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center p-3 border-b bg-white"
                      >
                        <MenuIcon className="h-5 w-5 text-gray-400 mr-4" />
                        <span className="flex-grow font-medium">{style.name}</span>
                        <span className="text-sm text-gray-500 mr-4">{style.tattooCount || 0} tatuajes</span>
                        <Button variant="ghost" size="sm" onClick={() => openModal(style)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => confirmDelete(style)}>
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {styles.length === 0 && <p className="p-4 text-center text-gray-500">No hay estilos definidos.</p>}
      </Card>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedStyle ? 'Editar Estilo' : 'Nuevo Estilo'}>
          <StyleForm 
            style={selectedStyle} 
            onSave={handleSaveStyle} 
            onCancel={() => setIsModalOpen(false)} 
            isLoading={loading}
          />
        </Modal>
      )}

      {isDeleting && styleToDelete && (
        <Modal isOpen={isDeleting} onClose={() => setIsDeleting(false)} title="Confirmar Eliminación">
          <p>¿Estás seguro de que quieres eliminar el estilo "<strong>{styleToDelete.name}</strong>"?</p>
          <div className="flex justify-end space-x-4 mt-4">
            <Button variant="outline" onClick={() => setIsDeleting(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Eliminar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
} 