'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Card, Listbox } from '@/components/ui';
import { Tattoo, Category, Style, CreateTattooData } from '@/types';
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

export default function NewTattooPage() {
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TattooFormData>({
    resolver: zodResolver(tattooSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      style: '',
      tags: [],
      size: 'mediano',
      bodyPart: 'otro',
      isFeatured: false,
      isPublished: true,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, stls] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getStyles(),
        ]);
        setCategories(cats);
        setStyles(stls);
      } catch (error) {
        toast.error('Error al cargar datos necesarios.');
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: TattooFormData) => {
    if (images.length === 0) {
      toast.error('Debes subir al menos una imagen.');
      return;
    }

    setIsLoading(true);
    try {
      const tattooData: CreateTattooData = {
        ...data,
        images: images.map(img => ({ url: img.url, publicId: img.publicId, width: img.width, height: img.height })),
      };
      await apiClient.createTattoo(tattooData);
      toast.success('Tatuaje creado con éxito');
      router.push('/admin/tattoos');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el tatuaje');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Añadir Nuevo Tatuaje</h1>
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
                <ImageUpload onUpload={setImages} />
              </div>
            </Card>
            <div className="mt-8">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Crear Tatuaje
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 