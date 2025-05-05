'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Quadro, Lista, Tarefa } from '@/lib/crm-utils';
import { ListaKanban } from './lista-kanban';
import { PlusIcon, ArrowLeftIcon } from 'lucide-react';

interface QuadroBoardProps {
  quadro: Quadro;
  listas: Lista[];
  tarefas: Record<string, Tarefa[]>;
  onAddLista?: () => void;
  onEditLista?: (lista: Lista) => void;
  onDeleteLista?: (lista: Lista) => void;
  onAddTarefa?: (listaId: string) => void;
  onEditTarefa?: (tarefa: Tarefa) => void;
  onDeleteTarefa?: (tarefa: Tarefa) => void;
  onMoveTarefa?: (tarefaId: string, novaListaId: string, novaOrdem: number) => void;
}

export function QuadroBoard({
  quadro,
  listas,
  tarefas,
  onAddLista,
  onEditLista,
  onDeleteLista,
  onAddTarefa,
  onEditTarefa,
  onDeleteTarefa,
  onMoveTarefa,
}: QuadroBoardProps) {
  const router = useRouter();
  const [draggedTarefaId, setDraggedTarefaId] = useState<string | null>(null);
  const [sourceListaId, setSourceListaId] = useState<string | null>(null);
  const [targetListaId, setTargetListaId] = useState<string | null>(null);

  const handleDragStart = (tarefaId: string, listaId: string) => {
    setDraggedTarefaId(tarefaId);
    setSourceListaId(listaId);
  };

  const handleDragOver = (listaId: string) => {
    if (listaId !== targetListaId) {
      setTargetListaId(listaId);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedTarefaId || !targetListaId || !onMoveTarefa) return;
    
    // Se a lista de destino for diferente da lista de origem
    if (targetListaId !== sourceListaId) {
      // Definimos a nova ordem como a última posição da lista de destino
      const novaPosicao = tarefas[targetListaId]?.length || 0;
      onMoveTarefa(draggedTarefaId, targetListaId, novaPosicao);
    }
    
    // Limpar estados
    setDraggedTarefaId(null);
    setSourceListaId(null);
    setTargetListaId(null);
  };

  useEffect(() => {
    // Adicionar evento de drop no documento
    const handleGlobalDrop = (e: DragEvent) => {
      handleDrop(e as unknown as React.DragEvent);
    };

    document.addEventListener('drop', handleGlobalDrop);
    
    return () => {
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, [draggedTarefaId, sourceListaId, targetListaId]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/tarefas')}
            className="mr-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{quadro.titulo}</h1>
          {quadro.descricao && (
            <p className="ml-4 text-sm text-muted-foreground">{quadro.descricao}</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          {onAddLista && (
            <Button
              onClick={onAddLista}
              variant="outline"
              size="sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Nova Lista
            </Button>
          )}
        </div>
      </div>
      
      <div 
        className="flex-grow overflow-x-auto p-4 flex space-x-4"
        onDragOver={(e) => e.preventDefault()}
      >
        {listas.map((lista) => (
          <ListaKanban
            key={lista.id}
            lista={lista}
            tarefas={tarefas[lista.id] || []}
            onAddTarefa={onAddTarefa}
            onEditLista={onEditLista}
            onDeleteLista={onDeleteLista}
            onEditTarefa={onEditTarefa}
            onDeleteTarefa={onDeleteTarefa}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
          />
        ))}
        
        {onAddLista && (
          <div className="w-72 min-w-[18rem] h-full flex items-start">
            <Button
              variant="outline"
              className="w-full"
              onClick={onAddLista}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Adicionar Lista
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
