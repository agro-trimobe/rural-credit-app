'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tarefa } from '@/lib/crm-utils';
import { formatarData } from '@/lib/formatters';
import { 
  AlarmClockIcon, 
  MoreHorizontal, 
  PenIcon, 
  TagIcon, 
  TrashIcon,
  UserIcon
} from 'lucide-react';
import { useState } from 'react';

interface TarefaCardProps {
  tarefa: Tarefa;
  onEdit?: (tarefa: Tarefa) => void;
  onDelete?: (tarefa: Tarefa) => void;
  onDragStart?: (tarefaId: string, listaId: string) => void;
}

export function TarefaCard({ tarefa, onEdit, onDelete, onDragStart }: TarefaCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      e.dataTransfer.setData('tarefaId', tarefa.id);
      onDragStart(tarefa.id, tarefa.listaId);
    }
  };

  // Função para determinar a cor de fundo baseada na prioridade
  const getPrioridadeBgColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'Alta':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Baixa':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card 
      className="cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm line-clamp-2">{tarefa.titulo}</h3>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 rounded-md bg-white shadow-lg z-10 border py-1">
                {onEdit && (
                  <button
                    className="text-left w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit(tarefa);
                    }}
                  >
                    <PenIcon className="h-3 w-3 mr-2" />
                    Editar tarefa
                  </button>
                )}
                {onDelete && (
                  <button
                    className="text-left w-full px-4 py-2 text-xs text-red-600 hover:bg-gray-100 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(tarefa);
                    }}
                  >
                    <TrashIcon className="h-3 w-3 mr-2" />
                    Excluir tarefa
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {tarefa.descricao && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {tarefa.descricao}
          </p>
        )}

        <div className="mt-3 space-y-2">
          {tarefa.prioridade && (
            <Badge 
              variant="outline" 
              className={`text-xs ${getPrioridadeBgColor(tarefa.prioridade)}`}
            >
              {tarefa.prioridade}
            </Badge>
          )}
          
          {tarefa.etiquetas && tarefa.etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tarefa.etiquetas.map((etiqueta, index) => (
                <div 
                  key={index} 
                  className="flex items-center text-xs font-medium"
                >
                  <TagIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {etiqueta}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
          {tarefa.prazo && (
            <div className="flex items-center">
              <AlarmClockIcon className="h-3 w-3 mr-1" />
              <span>{formatarData(tarefa.prazo)}</span>
            </div>
          )}
          
          {tarefa.responsavel && (
            <div className="flex items-center">
              <UserIcon className="h-3 w-3 mr-1" />
              <span>{tarefa.responsavel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
