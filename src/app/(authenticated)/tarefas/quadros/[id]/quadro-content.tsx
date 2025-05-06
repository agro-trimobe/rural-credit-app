'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

import { QuadroBoard } from '@/components/tarefas/quadro-board';
import { CriarListaDialog } from '@/components/tarefas/criar-lista-dialog';
import { TarefaDialog } from '@/components/tarefas/tarefa-dialog';
import { DragDropProvider } from '@/components/tarefas/drag-drop-context';
import { Quadro, Lista, Tarefa } from '@/lib/crm-utils';

interface QuadroContentProps {
  quadroId: string;
}

export default function QuadroContent({ quadroId }: QuadroContentProps) {
  const router = useRouter();

  const [quadro, setQuadro] = useState<Quadro | null>(null);
  const [listas, setListas] = useState<Lista[]>([]);
  const [tarefasPorLista, setTarefasPorLista] = useState<Record<string, Tarefa[]>>({});
  const [loading, setLoading] = useState(true);
  
  const [openListaDialog, setOpenListaDialog] = useState(false);
  const [listaParaEditar, setListaParaEditar] = useState<Lista | undefined>(undefined);
  
  const [openTarefaDialog, setOpenTarefaDialog] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState<Tarefa | undefined>(undefined);
  const [listaIdSelecionada, setListaIdSelecionada] = useState<string | undefined>(undefined);

  // Carregar o quadro, listas e tarefas ao montar o componente
  useEffect(() => {
    carregarQuadro();
    carregarListas();
  }, [quadroId]);

  // Carregar tarefas sempre que as listas mudarem
  useEffect(() => {
    if (listas.length > 0) {
      carregarTarefas();
    }
  }, [listas]);

  const carregarQuadro = async () => {
    try {
      const response = await fetch(`/api/tarefas/quadros/${quadroId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: 'Quadro não encontrado',
            description: 'O quadro solicitado não existe ou foi removido.',
            variant: 'destructive',
          });
          router.push('/tarefas');
          return;
        }
        throw new Error(`Erro ao carregar quadro: ${response.status}`);
      }
      
      const data = await response.json();
      setQuadro(data.quadro);
    } catch (error) {
      console.error('Erro ao carregar quadro:', error);
      toast({
        title: 'Erro ao carregar quadro',
        description: 'Não foi possível carregar o quadro. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const carregarListas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tarefas/listas?quadroId=${quadroId}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar listas: ${response.status}`);
      }
      
      const data = await response.json();
      setListas(data.listas || []);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      toast({
        title: 'Erro ao carregar listas',
        description: 'Não foi possível carregar as listas. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarTarefas = async () => {
    try {
      const tarefasTemp: Record<string, Tarefa[]> = {};
      
      // Inicializar arrays vazios para todas as listas
      listas.forEach(lista => {
        tarefasTemp[lista.id] = [];
      });
      
      const response = await fetch(`/api/tarefas/tarefas?quadroId=${quadroId}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar tarefas: ${response.status}`);
      }
      
      const data = await response.json();
      const todasTarefas = data.tarefas || [];
      
      // Agrupar tarefas por lista
      todasTarefas.forEach((tarefa: Tarefa) => {
        if (tarefasTemp[tarefa.listaId]) {
          tarefasTemp[tarefa.listaId].push(tarefa);
        }
      });
      
      // Ordenar tarefas em cada lista
      Object.keys(tarefasTemp).forEach(listaId => {
        tarefasTemp[listaId].sort((a, b) => a.ordem - b.ordem);
      });
      
      setTarefasPorLista(tarefasTemp);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast({
        title: 'Erro ao carregar tarefas',
        description: 'Não foi possível carregar as tarefas. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleAdicionarLista = () => {
    setListaParaEditar(undefined);
    setOpenListaDialog(true);
  };

  const handleEditarLista = (lista: Lista) => {
    setListaParaEditar(lista);
    setOpenListaDialog(true);
  };

  const handleExcluirLista = async (lista: Lista) => {
    if (!confirm(`Tem certeza que deseja excluir a lista "${lista.titulo}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tarefas/listas/${lista.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir lista: ${response.status}`);
      }

      toast({
        title: 'Lista excluída',
        description: 'A lista foi excluída com sucesso.',
      });

      // Atualizar a lista de listas
      carregarListas();
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
      toast({
        title: 'Erro ao excluir lista',
        description: 'Não foi possível excluir a lista. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleSalvarLista = async (listaData: Partial<Lista>) => {
    try {
      const isEdicao = !!listaParaEditar;
      const url = isEdicao 
        ? `/api/tarefas/listas/${listaParaEditar.id}` 
        : '/api/tarefas/listas';
      
      const method = isEdicao ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listaData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} lista: ${response.status}`);
      }

      toast({
        title: isEdicao ? 'Lista atualizada' : 'Lista criada',
        description: isEdicao 
          ? 'A lista foi atualizada com sucesso.' 
          : 'A lista foi criada com sucesso.',
      });

      // Atualizar as listas
      carregarListas();
    } catch (error) {
      console.error('Erro ao salvar lista:', error);
      toast({
        title: 'Erro ao salvar lista',
        description: 'Não foi possível salvar a lista. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleAdicionarTarefa = (listaId: string) => {
    setTarefaParaEditar(undefined);
    setListaIdSelecionada(listaId);
    setOpenTarefaDialog(true);
  };

  const handleEditarTarefa = (tarefa: Tarefa) => {
    setTarefaParaEditar(tarefa);
    setOpenTarefaDialog(true);
  };

  const handleExcluirTarefa = async (tarefa: Tarefa) => {
    if (!confirm(`Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tarefas/tarefas/${tarefa.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir tarefa: ${response.status}`);
      }

      toast({
        title: 'Tarefa excluída',
        description: 'A tarefa foi excluída com sucesso.',
      });

      // Atualizar as tarefas
      carregarTarefas();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast({
        title: 'Erro ao excluir tarefa',
        description: 'Não foi possível excluir a tarefa. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleSalvarTarefa = async (tarefaData: Partial<Tarefa>) => {
    try {
      // Verificar e logar os dados para diagnóstico
      console.log('Dados da tarefa:', tarefaData);
      
      // Verificar campos obrigatórios
      if (!tarefaData.titulo) {
        toast({
          title: 'Erro ao salvar tarefa',
          description: 'O título da tarefa é obrigatório',
          variant: 'destructive',
        });
        return;
      }
      
      if (!tarefaData.listaId) {
        toast({
          title: 'Erro ao salvar tarefa',
          description: 'O ID da lista é obrigatório',
          variant: 'destructive',
        });
        return;
      }
      
      const isEdicao = !!tarefaParaEditar;
      const url = isEdicao 
        ? `/api/tarefas/tarefas/${tarefaParaEditar.id}` 
        : '/api/tarefas/tarefas';
      
      const method = isEdicao ? 'PUT' : 'POST';
      
      const novaOrdem = tarefaData.ordem !== undefined 
        ? tarefaData.ordem 
        : tarefasPorLista[tarefaData.listaId || '']?.length || 0;
      
      // Garantir que todos os campos obrigatórios estejam presentes
      const tarefaCompleta = {
        ...tarefaData,
        quadroId,  // Garantir que o quadroId esteja definido
        listaId: tarefaData.listaId, // Garantir que o listaId esteja definido
        titulo: tarefaData.titulo,   // Garantir que o título esteja definido
        ordem: novaOrdem,
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tarefaCompleta),
      });

      if (!response.ok) {
        throw new Error(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} tarefa: ${response.status}`);
      }

      toast({
        title: isEdicao ? 'Tarefa atualizada' : 'Tarefa criada',
        description: isEdicao 
          ? 'A tarefa foi atualizada com sucesso.' 
          : 'A tarefa foi criada com sucesso.',
      });

      // Atualizar as tarefas
      carregarTarefas();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: 'Erro ao salvar tarefa',
        description: 'Não foi possível salvar a tarefa. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleMoverTarefa = async (tarefaId: string, novaListaId: string, novaOrdem: number) => {
    try {
      const response = await fetch(`/api/tarefas/tarefas/${tarefaId}/mover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listaId: novaListaId,
          ordem: novaOrdem,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao mover tarefa: ${response.status}`);
      }

      // Atualizar as tarefas sem notificação
      carregarTarefas();
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      toast({
        title: 'Erro ao mover tarefa',
        description: 'Não foi possível mover a tarefa. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  if (loading && !quadro) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quadro) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Quadro não encontrado</h2>
          <p className="mb-4 text-muted-foreground">O quadro solicitado não existe ou foi removido.</p>
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => router.push('/tarefas')}
          >
            Voltar para Tarefas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)]">
      <DragDropProvider onMoveTarefa={handleMoverTarefa}>
        <QuadroBoard
          quadro={quadro}
          listas={listas}
          tarefas={tarefasPorLista}
          onAddLista={handleAdicionarLista}
          onEditLista={handleEditarLista}
          onDeleteLista={handleExcluirLista}
          onAddTarefa={handleAdicionarTarefa}
          onEditTarefa={handleEditarTarefa}
          onDeleteTarefa={handleExcluirTarefa}
          onMoveTarefa={handleMoverTarefa}
        />
      </DragDropProvider>

      <CriarListaDialog
        open={openListaDialog}
        onOpenChange={setOpenListaDialog}
        quadroId={quadroId}
        lista={listaParaEditar}
        onSave={handleSalvarLista}
      />

      <TarefaDialog
        open={openTarefaDialog}
        onOpenChange={setOpenTarefaDialog}
        listas={listas}
        listaIdInicial={listaIdSelecionada}
        tarefa={tarefaParaEditar}
        onSave={handleSalvarTarefa}
      />
    </div>
  );
}
