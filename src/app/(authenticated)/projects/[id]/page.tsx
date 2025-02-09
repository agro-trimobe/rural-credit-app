'use client';

import { ProjectDetails } from './project-details';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronRight, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useProject } from "@/hooks/useProject";
import { ProjectStatus } from "@/components/project-status";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Suspense, use } from 'react';
import { DocumentsList } from './documents-list';
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

type PageProps = {
  params: Promise<{ id: string }>;
};

function ProjectClient({ id }: { id: string }) {
  const { project, isLoading, mutate } = useProject(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">Projeto não encontrado</div>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir projeto');
      }

      mutate();
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o projeto",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/projects" className="hover:text-primary">Projetos</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground">{project.projectName}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{project.projectName}</h1>
          <div className="flex items-center gap-3">
            <ProjectStatus status={project.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/projects/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProjectDetails id={id} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <DocumentsList id={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProjectPage({ params }: PageProps) {
  const resolvedParams = use(params);
  
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ProjectClient id={resolvedParams.id} />
    </Suspense>
  );
}