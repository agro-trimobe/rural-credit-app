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
import { Tarefa, Lista } from '@/lib/crm-utils';

interface TarefaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listas: Lista[];
  tarefa?: Partial<Tarefa>;
  listaIdInicial?: string;
  onSave: (tarefa: Partial<Tarefa>) => void;
}

export function TarefaDialog({ 
  open, 
  onOpenChange, 
  listas,
  tarefa,
  listaIdInicial,
  onSave 
}: TarefaDialogProps) {
  const [titulo, setTitulo] = useState(tarefa?.titulo || '');
  const [descricao, setDescricao] = useState(tarefa?.descricao || '');
  const [listaId, setListaId] = useState(tarefa?.listaId || listaIdInicial || (listas[0]?.id || ''));
  const [prazo, setPrazo] = useState(tarefa?.prazo ? new Date(tarefa.prazo).toISOString().split('T')[0] : '');
  const [responsavel, setResponsavel] = useState(tarefa?.responsavel || '');
  const [prioridade, setPrioridade] = useState(tarefa?.prioridade || 'Média');
  const [etiquetas, setEtiquetas] = useState(tarefa?.etiquetas?.join(', ') || '');

  const handleSave = () => {
    if (!titulo.trim()) return;

    const novaTarefa: Partial<Tarefa> = {
      ...tarefa,
      titulo,
      descricao: descricao.trim() || undefined,
      listaId,
      prazo: prazo ? new Date(prazo).toISOString() : undefined,
      responsavel: responsavel.trim() || undefined,
      prioridade: prioridade as 'Baixa' | 'Média' | 'Alta',
      etiquetas: etiquetas.trim() ? etiquetas.split(',').map(tag => tag.trim()) : undefined,
    };

    onSave(novaTarefa);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{tarefa?.id ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título da tarefa"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição detalhada da tarefa"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="lista">Lista</Label>
            <select
              id="lista"
              value={listaId}
              onChange={(e) => setListaId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {listas.map((lista) => (
                <option key={lista.id} value={lista.id}>
                  {lista.titulo}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="prazo">Prazo</Label>
              <Input
                id="prazo"
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="prioridade">Prioridade</Label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="baixa"
                  value="Baixa"
                  checked={prioridade === 'Baixa'}
                  onChange={() => setPrioridade('Baixa')}
                />
                <label htmlFor="baixa" className="text-sm">Baixa</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="media"
                  value="Média"
                  checked={prioridade === 'Média'}
                  onChange={() => setPrioridade('Média')}
                />
                <label htmlFor="media" className="text-sm">Média</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="alta"
                  value="Alta"
                  checked={prioridade === 'Alta'}
                  onChange={() => setPrioridade('Alta')}
                />
                <label htmlFor="alta" className="text-sm">Alta</label>
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="etiquetas">Etiquetas (separadas por vírgula)</Label>
            <Input
              id="etiquetas"
              value={etiquetas}
              onChange={(e) => setEtiquetas(e.target.value)}
              placeholder="Ex: urgente, cliente, pendente"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            {tarefa?.id ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
