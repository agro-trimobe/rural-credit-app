'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lista, Tarefa } from '@/lib/crm-utils';
import { MoreHorizontal, PlusIcon } from 'lucide-react';
import { TarefaCard } from './tarefa-card';

interface ListaKanbanProps {
  lista: Lista;
  tarefas: Tarefa[];
  onAddTarefa?: (listaId: string) => void;
  onEditLista?: (lista: Lista) => void;
  onDeleteLista?: (lista: Lista) => void;
  onEditTarefa?: (tarefa: Tarefa) => void;
  onDeleteTarefa?: (tarefa: Tarefa) => void;
  onDragStart?: (tarefaId: string, listaId: string) => void;
  onDragOver?: (listaId: string) => void;
}

export function ListaKanban({
  lista,
  tarefas,
  onAddTarefa,
  onEditLista,
  onDeleteLista,
  onEditTarefa,
  onDeleteTarefa,
  onDragStart,
  onDragOver,
}: ListaKanbanProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDragOver) {
      onDragOver(lista.id);
    }
  };

  return (
    <Card 
      className="h-full flex flex-col w-72 min-w-[18rem]" 
      style={{ 
        borderTop: lista.cor ? `4px solid ${lista.cor}` : '4px solid #0ea5e9' 
      }}
      onDragOver={handleDragOver}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-medium">{lista.titulo}</CardTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 rounded-md bg-white shadow-lg z-10 border py-1">
                {onEditLista && (
                  <button
                    className="text-left w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowMenu(false);
                      onEditLista(lista);
                    }}
                  >
                    Editar lista
                  </button>
                )}
                {onDeleteLista && (
                  <button
                    className="text-left w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteLista(lista);
                    }}
                  >
                    Excluir lista
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow overflow-auto">
        <div className="space-y-2">
          {tarefas.map((tarefa) => (
            <TarefaCard
              key={tarefa.id}
              tarefa={tarefa}
              onEdit={onEditTarefa}
              onDelete={onDeleteTarefa}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </CardContent>
      <div className="p-3 pt-0">
        {onAddTarefa && (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => onAddTarefa(lista.id)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Adicionar Tarefa
          </Button>
        )}
      </div>
    </Card>
  );
}
