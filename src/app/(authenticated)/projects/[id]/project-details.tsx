'use client';

import React from 'react';
import { useProject } from '@/hooks/useProject';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, FileText, Home } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ProjectDetailsProps {
  id: string;
}

export function ProjectDetails({ id }: ProjectDetailsProps) {
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
              {project.amount
                ? new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(project.amount)
                : 'R$ 0,00'}
            </span>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span className="ml-2">{project.status}</span>
          </div>
          <div>
            <span className="font-medium">Data de Criação:</span>
            <span className="ml-2">{formatDate(project.createdAt)}</span>
          </div>
          <div>
            <span className="font-medium">Última Atualização:</span>
            <span className="ml-2">{formatDate(project.updatedAt)}</span>
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
          <div className="flex gap-2">
            <span className="font-medium">Localização:</span>
            <span>
              {project.location || 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
