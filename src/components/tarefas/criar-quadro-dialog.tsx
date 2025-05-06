'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Quadro, Lista } from '@/lib/crm-utils';
import { KanbanIcon, CheckSquareIcon, ListIcon, FileTextIcon } from 'lucide-react';

interface CriarQuadroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quadro?: Quadro;
  onSave: (quadro: Partial<Quadro>) => void;
}

// Modelos predefinidos de quadros
const modelos = [
  {
    id: 'kanban',
    nome: 'Kanban',
    descricao: 'Modelo com colunas A fazer, Em andamento e Concluído',
    listas: [
      { titulo: 'A fazer', cor: '#ef4444' }, // Vermelho
      { titulo: 'Em andamento', cor: '#f59e0b' }, // Âmbar
      { titulo: 'Concluído', cor: '#10b981' } // Verde
    ],
    icon: <KanbanIcon className="h-5 w-5" />
  },
  {
    id: 'checklist',
    nome: 'Lista de verificação',
    descricao: 'Modelo simples com lista de tarefas e status',
    listas: [
      { titulo: 'Tarefas', cor: '#0ea5e9' } // Azul
    ],
    icon: <CheckSquareIcon className="h-5 w-5" />
  },
  {
    id: 'projeto',
    nome: 'Projeto',
    descricao: 'Modelo para gerenciamento de projetos com etapas',
    listas: [
      { titulo: 'Planejamento', cor: '#8b5cf6' }, // Violeta
      { titulo: 'Desenvolvimento', cor: '#0ea5e9' }, // Azul
      { titulo: 'Testes', cor: '#f59e0b' }, // Âmbar
      { titulo: 'Entrega', cor: '#10b981' } // Verde
    ],
    icon: <FileTextIcon className="h-5 w-5" />
  }
];

export function CriarQuadroDialog({ 
  open, 
  onOpenChange, 
  quadro,
  onSave 
}: CriarQuadroDialogProps) {
  const [titulo, setTitulo] = useState(quadro?.titulo || '');
  const [descricao, setDescricao] = useState(quadro?.descricao || '');
  const [cor, setCor] = useState(quadro?.cor || '#0ea5e9');
  const [activeTab, setActiveTab] = useState<string>('personalizado');
  const [modeloSelecionado, setModeloSelecionado] = useState<string | undefined>(quadro?.modeloId);

  const handleSave = () => {
    if (!titulo.trim()) return;

    const novoQuadro: Partial<Quadro> = {
      ...quadro,
      titulo,
      descricao: descricao.trim() || undefined,
      cor,
      modeloId: modeloSelecionado
    };

    onSave(novoQuadro);
    onOpenChange(false);
  };
  
  const selecionarModelo = (modeloId: string) => {
    const modelo = modelos.find(m => m.id === modeloId);
    if (modelo) {
      setModeloSelecionado(modeloId);
      // Se o título estiver vazio, use o nome do modelo
      if (!titulo.trim()) {
        setTitulo(modelo.nome);
      }
      // Se a descrição estiver vazia, use a descrição do modelo
      if (!descricao.trim()) {
        setDescricao(modelo.descricao);
      }
    }
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{quadro?.id ? 'Editar Quadro' : 'Novo Quadro'}</DialogTitle>
          <DialogDescription>
            {quadro?.id ? 'Edite os detalhes do quadro existente' : 'Crie um novo quadro para organizar suas tarefas'}
          </DialogDescription>
        </DialogHeader>
        
        {!quadro?.id && (
          <Tabs defaultValue="personalizado" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personalizado">Personalizado</TabsTrigger>
              <TabsTrigger value="modelos">Usar Modelo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personalizado" className="mt-4">
              <div className="grid gap-4">
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
                        className="w-8 h-8 p-0 border-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="modelos" className="mt-4">
              <div className="grid gap-4 md:grid-cols-3">
                {modelos.map(modelo => (
                  <Card 
                    key={modelo.id} 
                    className={`cursor-pointer hover:shadow-md transition-all ${modeloSelecionado === modelo.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => selecionarModelo(modelo.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {modelo.icon}
                          {modelo.nome}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs line-clamp-2">
                        {modelo.descricao}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-1 mt-2">
                        {modelo.listas.map((lista, index) => (
                          <div 
                            key={index}
                            className="h-2 flex-1 rounded-full"
                            style={{ backgroundColor: lista.cor }}
                            title={lista.titulo}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Quando está editando um quadro, mostra apenas os campos básicos */}
        {quadro?.id && (
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
                    className="w-8 h-8 p-0 border-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Pré-visualização do quadro */}
        {titulo && (
          <div className="border rounded-md p-3 bg-muted/30">
            <Label className="text-xs text-muted-foreground mb-2 block">Pré-visualização:</Label>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-12 rounded-l" 
                style={{ backgroundColor: cor }}
              />
              <div>
                <div className="font-semibold">{titulo}</div>
                {descricao && (
                  <div className="text-xs text-muted-foreground line-clamp-1">{descricao}</div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancelar</Button>
          <Button onClick={handleSave} disabled={!titulo.trim()}>
            {quadro?.id ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
