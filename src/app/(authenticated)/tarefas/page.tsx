'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { QuadroCard } from '@/components/tarefas/quadro-card';
import { CriarQuadroDialog } from '@/components/tarefas/criar-quadro-dialog';
import { Quadro } from '@/lib/crm-utils';

export default function TarefasPage() {
  const router = useRouter();
  const [quadros, setQuadros] = useState<Quadro[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [quadroParaEditar, setQuadroParaEditar] = useState<Quadro | undefined>(undefined);

  // Carregar os quadros ao montar o componente
  useEffect(() => {
    carregarQuadros();
  }, []);

  const carregarQuadros = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tarefas/quadros');
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar quadros: ${response.status}`);
      }
      
      const data = await response.json();
      setQuadros(data.quadros || []);
    } catch (error) {
      console.error('Erro ao carregar quadros:', error);
      toast({
        title: 'Erro ao carregar quadros',
        description: 'Não foi possível carregar os quadros. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCriarQuadro = () => {
    setQuadroParaEditar(undefined);
    setOpenDialog(true);
  };

  const handleEditarQuadro = (quadro: Quadro) => {
    setQuadroParaEditar(quadro);
    setOpenDialog(true);
  };

  const handleExcluirQuadro = async (quadro: Quadro) => {
    if (!confirm(`Tem certeza que deseja excluir o quadro "${quadro.titulo}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tarefas/quadros/${quadro.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir quadro: ${response.status}`);
      }

      toast({
        title: 'Quadro excluído',
        description: 'O quadro foi excluído com sucesso.',
      });

      // Atualizar a lista de quadros
      carregarQuadros();
    } catch (error) {
      console.error('Erro ao excluir quadro:', error);
      toast({
        title: 'Erro ao excluir quadro',
        description: 'Não foi possível excluir o quadro. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleSalvarQuadro = async (quadroData: Partial<Quadro>) => {
    try {
      const isEdicao = !!quadroParaEditar;
      const url = isEdicao 
        ? `/api/tarefas/quadros/${quadroParaEditar.id}` 
        : '/api/tarefas/quadros';
      
      const method = isEdicao ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quadroData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} quadro: ${response.status}`);
      }

      toast({
        title: isEdicao ? 'Quadro atualizado' : 'Quadro criado',
        description: isEdicao 
          ? 'O quadro foi atualizado com sucesso.' 
          : 'O quadro foi criado com sucesso.',
      });

      // Atualizar a lista de quadros
      carregarQuadros();
    } catch (error) {
      console.error('Erro ao salvar quadro:', error);
      toast({
        title: 'Erro ao salvar quadro',
        description: 'Não foi possível salvar o quadro. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Tarefas</h1>
        <Button onClick={handleCriarQuadro}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Novo Quadro
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : quadros.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-background">
          <h3 className="text-lg font-medium mb-2">Nenhum quadro encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Crie um novo quadro para começar a organizar suas tarefas.
          </p>
          <Button onClick={handleCriarQuadro}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Criar Quadro
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quadros.map((quadro) => (
            <QuadroCard
              key={quadro.id}
              quadro={quadro}
              onEdit={handleEditarQuadro}
              onDelete={handleExcluirQuadro}
            />
          ))}
        </div>
      )}

      <CriarQuadroDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        quadro={quadroParaEditar}
        onSave={handleSalvarQuadro}
      />
    </div>
  );
}
