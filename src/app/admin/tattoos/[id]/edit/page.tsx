'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Card, Listbox } from '@/components/ui';
import { Tattoo, Category, Style, UpdateTattooData } from '@/types';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';
import ImageUpload from '@/components/admin/ImageUpload';

const tattooSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'Debes seleccionar una categoría'),
  style: z.string().min(1, 'Debes seleccionar un estilo'),
  tags: z.array(z.string()).optional(),
  size: z.enum(['pequeño', 'mediano', 'grande', 'extra-grande']),
  bodyPart: z.enum(['brazo', 'pierna', 'espalda', 'pecho', 'cuello', 'mano', 'pie', 'torso', 'otro']),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
});

type TattooFormData = z.infer<typeof tattooSchema>;

export default function EditTattooPage() {
  const router = useRouter();
  const params = useParams();
  const tattooId = params.id as string;

  const [images, setImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TattooFormData>({
    resolver: zodResolver(tattooSchema),
  });

  const fetchTattooData = useCallback(async () => {
    try {
      const [tattoo, cats, stls] = await Promise.all([
        apiClient.getTattoo(tattooId),
        apiClient.getCategories(),
        apiClient.getStyles(),
      ]);

      setCategories(cats);
      setStyles(stls);
      setImages(tattoo.images);
      
      reset({
        title: tattoo.title,
        description: tattoo.description,
        category: tattoo.category._id,
        style: tattoo.style._id,
        tags: tattoo.tags,
        size: tattoo.size,
        bodyPart: tattoo.bodyPart,
        isFeatured: tattoo.isFeatured,
        isPublished: tattoo.isPublished,
      });

    } catch (error) {
      toast.error('Error al cargar los datos del tatuaje.');
    } finally {
      setIsFetchingData(false);
    }
  }, [tattooId, reset]);

  useEffect(() => {
    if (tattooId) {
      fetchTattooData();
    }
  }, [tattooId, fetchTattooData]);

  const onSubmit = async (data: TattooFormData) => {
    if (images.length === 0) {
      toast.error('Debes tener al menos una imagen.');
      return;
    }

    setIsLoading(true);
    try {
      const tattooData: UpdateTattooData = {
        _id: tattooId,
        ...data,
        images: images.map(img => ({ url: img.url, publicId: img.publicId, width: img.width, height: img.height })),
      };
      await apiClient.updateTattoo(tattooId, tattooData);
      toast.success('Tatuaje actualizado con éxito');
      router.push('/admin/tattoos');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el tatuaje');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetchingData) {
    return <p>Cargando datos del tatuaje...</p>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Editar Tatuaje</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <div className="p-6">
                 <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Título" error={errors.title?.message} />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Descripción" type="textarea" className="mt-4" error={errors.description?.message} />
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Listbox
                        label="Categoría"
                        options={categories.map(c => ({ id: c._id, name: c.name }))}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.category?.message}
                      />
                    )}
                  />
                  <Controller
                    name="style"
                    control={control}
                    render={({ field }) => (
                      <Listbox
                        label="Estilo"
                        options={styles.map(s => ({ id: s._id, name: s.name }))}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.style?.message}
                      />
                    )}
                  />
                </div>
                {/* ... Otros campos ... */}
              </div>
            </Card>
          </div>
          <div className="md:col-span-1">
            <Card>
              <div className="p-6">
                <h3 className="font-semibold mb-4">Imágenes</h3>
                <ImageUpload existingImages={images} onUpload={setImages} />
              </div>
            </Card>
            <div className="mt-8">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 