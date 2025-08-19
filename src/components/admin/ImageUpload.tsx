'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { UploadResponse } from '@/types';
import { toast } from 'react-hot-toast';
import { XCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface ImageUploadProps {
  existingImages?: { url: string; publicId: string }[];
  onUpload: (images: UploadResponse[]) => void;
}

export default function ImageUpload({ existingImages = [], onUpload }: ImageUploadProps) {
  const [images, setImages] = useState<any[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    onUpload(images);
  }, [images, onUpload]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    setIsUploading(true);
    try {
      const uploadedImages = await apiClient.uploadImages(filesArray);
      setImages(prev => [...prev, ...uploadedImages]);
      toast.success('Imágenes subidas correctamente.');
    } catch (error) {
      toast.error('Error al subir las imágenes.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (publicId: string) => {
    // Optimistic UI update
    const originalImages = images;
    setImages(prev => prev.filter(img => img.publicId !== publicId));
    
    try {
      await apiClient.deleteImage(publicId);
      toast.success('Imagen eliminada.');
    } catch (error) {
      // Revert if API call fails
      setImages(originalImages);
      toast.error('No se pudo eliminar la imagen.');
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {images.map(image => (
          <div key={image.publicId} className="relative aspect-square">
            <Image
              src={image.url}
              alt="Tattoo image"
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(image.publicId)}
              className="absolute top-1 right-1 bg-white rounded-full text-red-500 hover:text-red-700"
              aria-label="Eliminar imagen"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        ))}
      </div>
      
      <label className="w-full flex items-center justify-center px-4 py-6 bg-gray-50 text-blue-500 rounded-lg shadow-sm tracking-wide uppercase border border-blue-200 cursor-pointer hover:bg-blue-100 hover:text-blue-600">
        <ArrowUpTrayIcon className="w-8 h-8 mr-3" />
        <span className="text-base leading-normal">{isUploading ? 'Subiendo...' : 'Añadir imágenes'}</span>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
          accept="image/png, image/jpeg, image/webp"
        />
      </label>
    </div>
  );
} 