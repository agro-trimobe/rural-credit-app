'use client';

import React from 'react';
import { useProject } from '@/hooks/useProject';
import { User, FileText, Home, Target, MapPin, Mail, Phone } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ProjectDetailsProps {
  id: string;
}

export function ProjectDetails({ id }: ProjectDetailsProps) {
  const { project, isLoading, isError } = useProject(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-muted-foreground">Carregando detalhes...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-destructive">Erro ao carregar detalhes do projeto</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-muted-foreground">Projeto não encontrado</div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Informações do Cliente */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h2 className="font-medium">Informações do Cliente</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Nome</label>
            <p className="font-medium mt-1">{project.clientName}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{project.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{project.phone}</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Criado em: {formatDate(project.createdAt)}</p>
            <p>Última atualização: {formatDate(project.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Informações do Crédito */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-medium">Informações do Crédito</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Linha de Crédito</label>
              <p className="font-medium mt-1">{project.creditLine}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Finalidade</label>
              <p className="font-medium mt-1">{project.purpose}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Valor solicitado:</span>
            <span className="font-medium">{formatCurrency(project.amount)}</span>
          </div>
        </div>
      </div>

      {/* Informações da Propriedade */}
      <div className="rounded-lg border bg-card p-6 md:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <Home className="h-5 w-5 text-primary" />
          <h2 className="font-medium">Informações da Propriedade</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-muted-foreground">Nome da Propriedade</label>
            <p className="font-medium mt-1">{project.propertyName}</p>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">Área Total</label>
            <p className="font-medium mt-1">{project.area.toLocaleString('pt-BR')} hectares</p>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{project.location || 'Localização não informada'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
