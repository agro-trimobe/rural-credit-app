'use client';

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  FileText, 
  Plus,
  Timer,
  CheckCircle2,
  AlertOctagon,
  FileUp,
  Search,
  Eye, 
  Pencil, 
  Trash,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useProjects } from '@/hooks/useProjects'
import { Project, ProjectStatus } from '@/types/project'
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
} from "@/components/ui/alert-dialog"
import { toast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import { ProjectStatus as ProjectStatusComponent } from '@/components/project-status'

const STATUS_CARDS = [
  { 
    status: 'em_andamento' as ProjectStatus, 
    label: 'Em Andamento',
    icon: Timer,
    iconClass: 'text-yellow-500 bg-yellow-50',
    bgClass: 'bg-yellow-50/50'
  },
  { 
    status: 'concluido' as ProjectStatus, 
    label: 'Concluídos',
    icon: CheckCircle2,
    iconClass: 'text-green-500 bg-green-50',
    bgClass: 'bg-green-50/50'
  },
  { 
    status: 'cancelado' as ProjectStatus, 
    label: 'Cancelados',
    icon: AlertOctagon,
    iconClass: 'text-red-500 bg-red-50',
    bgClass: 'bg-red-50/50'
  },
  { 
    status: 'aguardando_documentos' as ProjectStatus, 
    label: 'Aguardando Documentos',
    icon: FileUp,
    iconClass: 'text-blue-500 bg-blue-50',
    bgClass: 'bg-blue-50/50'
  },
  { 
    status: 'em_analise' as ProjectStatus, 
    label: 'Em Análise',
    icon: Search,
    iconClass: 'text-purple-500 bg-purple-50',
    bgClass: 'bg-purple-50/50'
  }
];

export default function DashboardPage() {
  const { projects, isLoading, isError, mutate } = useProjects();

  if (isLoading) return <div>Carregando...</div>;
  if (isError) return <div>Erro ao carregar projetos</div>;

  const handleDelete = async (id: string) => {
    try {
      await apiClient.projects.delete(id);
      mutate();
      toast({
        title: 'Sucesso',
        description: 'Projeto excluído com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o projeto',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Gerencie seus projetos de crédito rural
          </p>
        </div>
        <Link href="/projects/new">
          <Button size="sm" className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {/* Card Total */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gray-100/50">
              <FileText className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Projetos</p>
              <p className="text-2xl font-bold">{projects?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {STATUS_CARDS.map((statusCard) => {
            const count = projects?.filter((p: Project) => p.status === statusCard.status).length || 0;
            const Icon = statusCard.icon;
            
            return (
              <div 
                key={statusCard.status}
                className={cn(
                  "rounded-lg border bg-card text-card-foreground shadow-sm p-6",
                  "transition-all duration-200 hover:shadow-md",
                  statusCard.bgClass
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full", statusCard.iconClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{statusCard.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Projetos Recentes */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-1.5">
          <h3 className="font-semibold text-lg">Projetos Recentes</h3>
          <p className="text-sm text-muted-foreground">
            Lista dos últimos projetos cadastrados
          </p>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Linha de Crédito</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects?.slice(0, 5).map((project: Project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.clientName || 'N/A'}</TableCell>
                  <TableCell>{project.creditLine || 'N/A'}</TableCell>
                  <TableCell>
                    {typeof project.amount === 'number' 
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(project.amount)
                      : 'R$ 0,00'
                    }
                  </TableCell>
                  <TableCell>
                    <ProjectStatusComponent status={project.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/projects/${project.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(project.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
