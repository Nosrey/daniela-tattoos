'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Input } from '@/components/ui';
import type { Category, CreateCategoryData } from '@/types';
import { apiClient } from '@/lib/api';
import { EmojiPicker } from 'frimousse';
import { SketchPicker, ColorResult } from 'react-color';

interface CategoryFormProps {
  initialData?: Partial<Category> | null;
  onSubmit: (data: Partial<CreateCategoryData>) => void;
  onCancel: () => void;
  isSaving: boolean;
  submitButtonText?: string;
  error?: string | null;
}

export const CategoryForm = ({ initialData, onSubmit, onCancel, isSaving, submitButtonText = 'Guardar', error }: CategoryFormProps) => {
  const [formData, setFormData] = useState<Partial<CreateCategoryData>>({
    name: '',
    description: '',
    color: '#6B7280',
    icon: '',
    image: { url: '', publicId: '' },
  });
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        color: initialData.color || '#6B7280',
        icon: initialData.icon || '',
        image: initialData.image || { url: '', publicId: '' },
      });
    }
  }, [initialData]);

  // Effect to disable text selection while dragging the color picker
  useEffect(() => {
    const body = document.body;
    if (showColorPicker) {
      body.style.userSelect = 'none';
    } else {
      body.style.userSelect = 'auto';
    }
    // Cleanup on unmount
    return () => {
      body.style.userSelect = 'auto';
    };
  }, [showColorPicker]);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: ColorResult) => {
    setFormData(prev => ({ ...prev, color: color.hex }));
  };

  const handleEmojiSelect = ({ emoji }: { emoji: string }) => {
    setFormData(prev => ({ ...prev, icon: emoji, image: { url: '', publicId: '' } }));
    setShowEmojiPicker(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await apiClient.uploadImages([file]);
      if (uploaded.length > 0) {
        const { url, public_id } = uploaded[0];
        setFormData(prev => ({ ...prev, image: { url, publicId: public_id }, icon: '' }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // You might want to show an error to the user here
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: { url: '', publicId: '' } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        name="name"
        value={formData.name || ''}
        onChange={handleChange}
        required
      />
      <Input
        label="Descripción"
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <div className="flex items-center space-x-2 mt-1">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-10 h-10 border border-gray-300 rounded-md"
              style={{ backgroundColor: formData.color || '#ffffff' }}
            />
            {showColorPicker && (
              <div
                ref={colorPickerRef}
                className="absolute z-10 top-full mt-2 left-0 md:left-full md:top-1/2 md:-translate-y-1/2 md:mt-0 md:ml-4"
              >
                <SketchPicker
                  color={formData.color || '#ffffff'}
                  onChange={handleColorChange}
                />
              </div>
            )}
          </div>
          <Input
            name="color"
            value={formData.color || ''}
            onChange={handleChange}
            className="flex-grow"
            placeholder="Ej: #6B7280"
          />
        </div>
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">Icono (emoji)</label>
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="w-full text-left mt-1 px-3 py-2 border border-gray-300 rounded-md h-10"
        >
          {formData.icon ? (
            <span className="text-xl">{formData.icon}</span>
          ) : (
            <span className="text-gray-400">Seleccionar emoji...</span>
          )}
        </button>
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute z-10 mt-2">
            <EmojiPicker.Root
              onEmojiSelect={handleEmojiSelect}
              className="isolate flex h-[368px] w-fit flex-col bg-white border rounded-md shadow-lg"
            >
              <EmojiPicker.Search className="z-10 mx-2 mt-2 appearance-none rounded-md bg-neutral-100 px-2.5 py-2 text-sm" />
              <EmojiPicker.Viewport className="relative flex-1 outline-hidden">
                <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
                  Cargando emojis…
                </EmojiPicker.Loading>
                <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
                  No se encontraron emojis.
                </EmojiPicker.Empty>
                <EmojiPicker.List
                  className="select-none pb-1.5"
                  components={{
                    CategoryHeader: ({ category, ...props }) => (
                      <div
                        className="bg-white px-3 pt-3 pb-1.5 font-medium text-neutral-600 text-xs"
                        {...props}
                      >
                        {category.label}
                      </div>
                    ),
                    Row: ({ children, ...props }) => (
                      <div className="scroll-my-1.5 px-1.5" {...props}>
                        {children}
                      </div>
                    ),
                    Emoji: ({ emoji, ...props }) => (
                      <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-neutral-100"
                        {...props}
                      >
                        {emoji.emoji}
                      </button>
                    ),
                  }}
                />
              </EmojiPicker.Viewport>
            </EmojiPicker.Root>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <hr className="flex-grow border-t border-gray-200" />
        <span className="text-xs text-gray-500">OR</span>
        <hr className="flex-grow border-t border-gray-200" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Icono (PNG/SVG)</label>
        {!formData.image?.url ? (
          <>
            <input type="file" onChange={handleFileChange} accept="image/png, image/svg+xml" className="mt-1" disabled={isUploading} />
            {isUploading && <p className="text-sm text-gray-500">Subiendo...</p>}
          </>
        ) : (
          <div className="flex items-center space-x-3 mt-2">
            <img src={formData.image.url} alt="Icono" className="w-12 h-12 object-contain" />
            <Button variant="secondary" size="sm" onClick={removeImage}>
              Quitar Imagen
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" role="alert">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving || isUploading}>
          {isSaving ? 'Guardando...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
}; 