'use client';

import React, { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText, Download, Trash } from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DocumentsListProps {
  id: string;
}

export function DocumentsList({ id: projectId }: DocumentsListProps) {
  const { data, isLoading, error, mutate } = useDocuments(projectId);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (docId: string) => {
    try {
      setDownloadingId(docId);
      const response = await fetch(`/api/projects/${projectId}/documents/${docId}/download`);
      if (!response.ok) {
        throw new Error('Erro ao gerar link de download');
      }
      const { url } = await response.json();
      
      // Criar um link temporário e clicar nele para iniciar o download
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      toast({
        variant: "destructive",
        title: "Erro ao baixar documento",
        description: "Tente novamente mais tarde."
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);

      await apiClient.documents.upload(formData);
      
      // Força uma nova requisição para buscar a lista atualizada
      await mutate();
      
      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar documento",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div>Carregando documentos...</div>;
  if (error) return <div>Erro ao carregar documentos</div>;

  const documents = data || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            <FileText className="mr-2 inline-block h-5 w-5" />
            Documentos do Projeto
          </CardTitle>
          <input
            type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await handleUpload(file);
              // Limpa o input para permitir selecionar o mesmo arquivo novamente
              e.target.value = '';
            }}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="h-9" asChild disabled={isUploading}>
              <span>{isUploading ? "Enviando..." : "Upload"}</span>
            </Button>
          </label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium">{doc.name || 'Sem nome'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatBytes(doc.size)} • {formatDate(doc.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDownload(doc.id)}
                      disabled={downloadingId === doc.id}
                    >
                      <Download className={`h-4 w-4 ${downloadingId === doc.id ? 'animate-pulse' : ''}`} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Documento</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              try {
                                await apiClient.documents.delete(projectId, doc.id);
                                await mutate();
                                toast({
                                  title: "Sucesso",
                                  description: "Documento excluído com sucesso",
                                });
                              } catch (error) {
                                console.error('Erro ao excluir documento:', error);
                                toast({
                                  title: "Erro",
                                  description: "Não foi possível excluir o documento",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Nenhum documento encontrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
