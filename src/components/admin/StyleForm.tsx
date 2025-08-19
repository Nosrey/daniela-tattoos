import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Style, CreateStyleData, UpdateStyleData } from '@/types';

interface StyleFormProps {
  style?: Style | null;
  onSave: (data: CreateStyleData | UpdateStyleData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function StyleForm({ style, onSave, onCancel, isLoading }: StyleFormProps) {
  const [name, setName] = useState(style?.name || '');
  const [description, setDescription] = useState(style?.description || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    setError('');
    
    const data: CreateStyleData | UpdateStyleData = {
      name,
      description,
    };

    if (style?._id) {
      (data as UpdateStyleData)._id = style._id;
    }
    
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input
          label="Nombre del Estilo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Blackwork, Realismo, etc."
          required
          error={error}
        />
        <Input
          label="Descripción (Opcional)"
          type="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Una breve descripción del estilo."
        />
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {style ? 'Guardar Cambios' : 'Crear Estilo'}
        </Button>
      </div>
    </form>
  );
} 