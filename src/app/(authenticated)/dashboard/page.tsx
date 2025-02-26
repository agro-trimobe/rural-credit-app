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
} from "@/components/ui/table"
import { 
  FileText, 
  Plus,
  Eye,
  Pencil,
  Trash
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useProjects } from '@/hooks/useProjects'
import { Project, ProjectStatus as ProjectStatusType } from '@/types/project'
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
import { ProjectStatus } from '@/components/project-status'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const STATUS_CONFIG = {
  'em_andamento': { label: 'Em Andamento', color: 'hsl(var(--chart-1))' },
  'concluido': { label: 'Concluído', color: 'hsl(var(--chart-2))' },
  'cancelado': { label: 'Cancelado', color: 'hsl(var(--chart-3))' },
  'aguardando_documentos': { label: 'Aguardando Documentos', color: 'hsl(var(--chart-4))' },
  'em_analise': { label: 'Em Análise', color: 'hsl(var(--chart-5))' }
};

const CREDIT_LINE_COLORS: Record<string, string> = {
  'pronaf': 'hsl(var(--chart-1))',
  'pronamp': 'hsl(var(--chart-2))',
  'moderfrota': 'hsl(var(--chart-3))',
  'pca': 'hsl(var(--chart-4))',
  'inovagro': 'hsl(var(--chart-5))',
  'moderinfra': 'hsl(200, 70%, 50%)',
  'prodecoop': 'hsl(150, 70%, 50%)',
  'abc': 'hsl(100, 70%, 50%)',
  'proirriga': 'hsl(250, 70%, 50%)',
  'pronara': 'hsl(300, 70%, 50%)',
  'finame': 'hsl(50, 70%, 50%)',
  'outros': 'hsl(0, 0%, 60%)'
};

export default function DashboardPage() {
  const { projects = [], isLoading, isError, mutate } = useProjects();

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

  // Prepare data for pie chart
  const statusData = Object.entries(STATUS_CONFIG).map(([status, config]) => ({
    name: config.label,
    value: projects.filter((p: Project) => p.status === status).length || 0,
    color: config.color
  })).filter(item => item.value > 0);

  // Calculate credit line data for bar chart
  const creditLineData = projects.reduce((acc: { [key: string]: number }, project: Project) => {
    const creditLine = project.creditLine?.toLowerCase() || 'outros';
    acc[creditLine] = (acc[creditLine] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.entries(creditLineData || {}).map(([line, count]) => ({
    name: line.charAt(0).toUpperCase() + line.slice(1),
    value: count,
    fill: CREDIT_LINE_COLORS[line.toLowerCase()] || CREDIT_LINE_COLORS.outros
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seus projetos de crédito rural
          </p>
        </div>
        <Link href="/projects/new">
          <Button size="sm" className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Status Distribution Chart */}
        <Card className="shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-base">Distribuição por Status</CardTitle>
            <CardDescription className="text-xs">Visão geral dos status dos projetos</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {statusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                    <span className="text-sm font-medium">({entry.value})</span>
                  </div>
                ))}
              </div>
              <div className="h-[200px] w-[200px] relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold">{statusData.reduce((sum, item) => sum + item.value, 0)}</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Modalidade */}
        <Card className="shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-base">Distribuição por Modalidade</CardTitle>
            <CardDescription className="text-xs">Distribuição dos projetos por linha de crédito</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {barChartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                    <span className="text-sm font-medium">({entry.value})</span>
                  </div>
                ))}
              </div>
              <div className="h-[200px] w-[200px] relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold">{barChartData.reduce((sum, item) => sum + item.value, 0)}</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={barChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projetos Recentes */}
      <Card className="shadow-sm">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-base">Projetos Recentes</CardTitle>
          <CardDescription className="text-xs">Lista dos últimos projetos cadastrados</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
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
              {projects.slice(0, 5).map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.clientName}</TableCell>
                  <TableCell>{project.creditLine}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(project.amount)}
                  </TableCell>
                  <TableCell>
                    <ProjectStatus status={project.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link href={`/projects/${project.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link href={`/projects/${project.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
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
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(project.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
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
        </CardContent>
      </Card>
    </div>
  );
}
