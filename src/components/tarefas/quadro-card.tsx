'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, PenIcon, TrashIcon, UsersIcon } from 'lucide-react';
import { Quadro } from '@/lib/crm-utils';
import { formatarData } from '@/lib/formatters';

interface QuadroCardProps {
  quadro: Quadro;
  onEdit?: (quadro: Quadro) => void;
  onDelete?: (quadro: Quadro) => void;
}

export function QuadroCard({ quadro, onEdit, onDelete }: QuadroCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/tarefas/quadros/${quadro.id}`);
  };

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md"
      style={{ 
        borderLeft: quadro.cor ? `4px solid ${quadro.cor}` : '4px solid #0ea5e9' 
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="truncate">{quadro.titulo}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        {quadro.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {quadro.descricao}
          </p>
        )}
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
          <span>Criado em {formatarData(quadro.dataCriacao)}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleClick}
        >
          Acessar Quadro
        </Button>
        <div className="flex space-x-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(quadro);
              }}
              title="Editar quadro"
            >
              <PenIcon className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(quadro);
              }}
              title="Excluir quadro"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
