'use client'

import { useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from './button';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  id: string;
  category: string;
  onSuccess?: () => void;
}

export function FileUpload({ id, category, onSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('id', id);
      formData.append('category', category);

      await apiClient.documents.upload(formData);
      onSuccess?.();
      
      // Limpa o input após o upload bem-sucedido
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
        accept=".pdf,.jpg,.jpeg,.png"
      />
      <label htmlFor="file-upload">
        <Button
          variant="outline"
          className="cursor-pointer"
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
        </Button>
      </label>
    </div>
  );
}
