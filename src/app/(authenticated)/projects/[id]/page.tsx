'use client';

import { Suspense, use, useState } from 'react';
import type { Usable } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/ui/file-upload';
import { useProject } from '@/hooks/useProjects';
import { useDocuments } from '@/hooks/useDocuments';
import type { Document } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ChevronRight, Download, FileText, Home, Pencil, Trash, User } from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="flex-1 space-y-6 p-8 pt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Detalhes do Projeto</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Detalhes do Projeto</h1>
          </div>
          <div className="flex gap-2">
            <Link href={`/projects/${id}/edit`}>
              <Button variant="outline" className="h-9">
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <Button variant="destructive" className="h-9">
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <ProjectDetails id={id} />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <DocumentsList id={id} />
          </TabsContent>
        </Tabs>
      </div>
    </Suspense>
  );
}

interface ProjectDetailsProps {
  id: string;
}

function ProjectDetails({ id }: ProjectDetailsProps) {
  const { project, isLoading, isError } = useProject(id);

  if (isLoading) return <div>Carregando...</div>;
  if (isError) return <div>Erro ao carregar detalhes do projeto</div>;
  if (!project) return <div>Projeto não encontrado</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            <User className="mr-2 inline-block h-5 w-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Nome:</span>
            <span className="ml-2">{project.clientName}</span>
          </div>
          <div>
            <span className="font-medium">Email:</span>
            <span className="ml-2">{project.email}</span>
          </div>
          <div>
            <span className="font-medium">Telefone:</span>
            <span className="ml-2">{project.phone}</span>
          </div>
          {project.document && (
            <div>
              <span className="font-medium">Documento:</span>
              <span className="ml-2">{project.document.name}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({formatBytes(project.document.size)})
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            <FileText className="mr-2 inline-block h-5 w-5" />
            Informações do Crédito
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Nome do Projeto:</span>
            <span className="ml-2">{project.projectName}</span>
          </div>
          {project.purpose && (
            <div>
              <span className="font-medium">Finalidade:</span>
              <span className="ml-2">{project.purpose}</span>
            </div>
          )}
          <div>
            <span className="font-medium">Linha de Crédito:</span>
            <span className="ml-2">{project.creditLine}</span>
          </div>
          <div>
            <span className="font-medium">Valor:</span>
            <span className="ml-2">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(project.amount)}
            </span>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span className="ml-2">{project.status}</span>
          </div>
          <div>
            <span className="font-medium">Data de Criação:</span>
            <span className="ml-2">
              {new Date(project.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div>
            <span className="font-medium">Última Atualização:</span>
            <span className="ml-2">
              {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            <Home className="mr-2 inline-block h-5 w-5" />
            Informações da Propriedade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Nome:</span>
            <span className="ml-2">{project.propertyName}</span>
          </div>
          <div>
            <span className="font-medium">Área:</span>
            <span className="ml-2">
              {project.area.toLocaleString('pt-BR')} hectares
            </span>
          </div>
          <div>
            <span className="font-medium">Localização:</span>
            <span className="ml-2">
              {project.location && typeof project.location === 'object' && 'latitude' in project.location
                ? `Latitude: ${project.location.latitude}, Longitude: ${project.location.longitude}`
                : typeof project.location === 'string'
                ? project.location
                : 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DocumentsListProps {
  id: string;
}

function DocumentsList({ id: projectId }: DocumentsListProps) {
  const { data, isLoading, error, mutate } = useDocuments(projectId);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
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
          <FileUpload 
            id={projectId} 
            category="general"
            onSuccess={() => {
              mutate();
            }}
          />
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        // TODO: Implementar exclusão de documento
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
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
