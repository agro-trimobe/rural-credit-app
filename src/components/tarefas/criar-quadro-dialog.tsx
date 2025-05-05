'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Quadro } from '@/lib/crm-utils';

interface CriarQuadroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quadro?: Quadro;
  onSave: (quadro: Partial<Quadro>) => void;
}

export function CriarQuadroDialog({ 
  open, 
  onOpenChange, 
  quadro,
  onSave 
}: CriarQuadroDialogProps) {
  const [titulo, setTitulo] = useState(quadro?.titulo || '');
  const [descricao, setDescricao] = useState(quadro?.descricao || '');
  const [cor, setCor] = useState(quadro?.cor || '#0ea5e9');

  const handleSave = () => {
    if (!titulo.trim()) return;

    const novoQuadro: Partial<Quadro> = {
      ...quadro,
      titulo,
      descricao: descricao.trim() || undefined,
      cor
    };

    onSave(novoQuadro);
    onOpenChange(false);
  };

  const coresPredefinidas = [
    '#0ea5e9', // Azul
    '#10b981', // Verde
    '#ef4444', // Vermelho
    '#f59e0b', // Âmbar
    '#8b5cf6', // Violeta
    '#ec4899', // Rosa
    '#6b7280', // Cinza
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{quadro?.id ? 'Editar Quadro' : 'Novo Quadro'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do quadro"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do quadro"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {coresPredefinidas.map((corPredefinida) => (
                <button
                  key={corPredefinida}
                  type="button"
                  className={`w-8 h-8 rounded-full cursor-pointer ${cor === corPredefinida ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  style={{ backgroundColor: corPredefinida }}
                  onClick={() => setCor(corPredefinida)}
                  aria-label={`Cor ${corPredefinida}`}
                />
              ))}
              <div className="flex items-center">
                <Input
                  type="color"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            {quadro?.id ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
