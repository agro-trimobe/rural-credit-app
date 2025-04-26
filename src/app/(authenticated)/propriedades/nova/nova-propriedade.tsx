'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, Save, MapPin, Ruler, Info, 
  Home, Map as MapIcon, Building, FileText, Eye, LocateFixed
} from 'lucide-react'
import { Propriedade, Cliente } from '@/lib/crm-utils'
import { propriedadesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Importação dinâmica do mapa para evitar problemas de SSR
// Definição da interface das props do MapSelector para uso antes do carregamento dinâmico
interface MapSelectorProps {
  initialPosition?: { latitude: number; longitude: number }
  onPositionChange: (position: { latitude: number; longitude: number }) => void
}

const MapSelector = dynamic<MapSelectorProps>(() => import('../../../../components/propriedades/map-selector'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  )
})

// Lista de estados brasileiros em ordem alfabética
const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

// Função para classificar o tamanho da propriedade
const classificarTamanho = (area: number) => {
  if (area < 20) {
    return { texto: 'Pequena', cor: 'bg-[hsl(12,76%,61%)] text-white' }; // --chart-1
  } else if (area >= 20 && area < 100) {
    return { texto: 'Média', cor: 'bg-[hsl(173,58%,39%)] text-white' }; // --chart-2
  } else {
    return { texto: 'Grande', cor: 'bg-[hsl(197,37%,24%)] text-white' }; // --chart-3
  }
};

export default function NovaPropriedadeConteudo() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({})
  
  // Estado do formulário com valores iniciais
  const [formData, setFormData] = useState<Partial<Propriedade>>({
    nome: '',
    clienteId: '',
    endereco: '',
    area: 0,
    municipio: '',
    estado: '',
    coordenadas: {
      latitude: 0,
      longitude: 0
    }
  })

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        setCarregando(true)
        const listaClientes = await clientesApi.listarClientes()
        setClientes(listaClientes)
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de clientes.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarClientes()
  }, [])

  // Validar um campo específico do formulário
  const validarCampo = (nome: string, valor: any): string => {
    if (['nome', 'endereco', 'municipio'].includes(nome) && (!valor || valor.trim() === '')) {
      return 'Este campo é obrigatório';
    }
    if (nome === 'clienteId' && (!valor || valor === '')) {
      return 'Selecione um proprietário';
    }
    if (nome === 'estado' && (!valor || valor === '')) {
      return 'Selecione um estado';
    }
    if (nome === 'area') {
      if (!valor || valor <= 0) {
        return 'Informe uma área válida';
      }
    }
    return '';
  };

  // Atualizar campo e validar
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'area') {
      const areaValue = parseFloat(value) || 0;
      setFormData({
        ...formData,
        [name]: areaValue
      });
      
      // Validar após a atualização
      const erro = validarCampo(name, areaValue);
      setErrosValidacao(prev => ({ ...prev, [name]: erro }));
    } else if (name === 'latitude' || name === 'longitude') {
      // Permitir valores vazios ou negativos para coordenadas
      const numeroProcessado = value === '' ? 0 : parseFloat(value)
      
      const novasCoordenadas = {
        latitude: name === 'latitude' ? numeroProcessado : formData.coordenadas?.latitude || 0,
        longitude: name === 'longitude' ? numeroProcessado : formData.coordenadas?.longitude || 0
      };
      
      setFormData({
        ...formData,
        coordenadas: novasCoordenadas
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Validar após a atualização
      const erro = validarCampo(name, value);
      setErrosValidacao(prev => ({ ...prev, [name]: erro }));
    }
  }

  // Atualizar campo de select e validar
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validar após a atualização
    const erro = validarCampo(name, value);
    setErrosValidacao(prev => ({ ...prev, [name]: erro }));
  }
  
  // Atualizar coordenadas a partir do mapa
  const handleMapPositionChange = (position: { latitude: number; longitude: number }) => {
    setFormData({
      ...formData,
      coordenadas: position
    });
  }

  // Validar todo o formulário
  const validarFormulario = (): boolean => {
    const campos = ['nome', 'clienteId', 'endereco', 'municipio', 'estado', 'area'];
    const novosErros: Record<string, string> = {};
    
    campos.forEach(campo => {
      let valor;
      if (campo === 'area') {
        valor = formData[campo as keyof typeof formData] as number;
      } else {
        valor = formData[campo as keyof typeof formData] as string;
      }
      
      novosErros[campo] = validarCampo(campo, valor);
    });
    
    setErrosValidacao(novosErros);
    
    // Retorna true se não houver erros
    return !Object.values(novosErros).some(erro => erro !== '');
  }

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar todos os campos antes de enviar
    if (!validarFormulario()) {
      toast({
        title: 'Campos inválidos',
        description: 'Por favor, corrija os campos destacados antes de continuar.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setEnviando(true);
      
      const novaPropriedade = await propriedadesApi.criarPropriedade(formData as Omit<Propriedade, 'id' | 'dataCriacao'>);
      
      toast({
        title: 'Propriedade criada',
        description: 'A propriedade foi criada com sucesso.',
      });
      
      router.push(`/propriedades/${novaPropriedade.id}`);
    } catch (error) {
      console.error('Erro ao criar propriedade:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a propriedade.',
        variant: 'destructive',
      });
    } finally {
      setEnviando(false);
    }
  }

  // Obter a classificação de tamanho para o preview
  const tamanhoPropriedade = classificarTamanho(formData.area || 0)
  
  // Estado de carregamento
  if (carregando) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Carregando formulário...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="icon" asChild className="h-8 w-8">
            <Link href="/propriedades">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Nova Propriedade</h1>
            <p className="text-sm text-muted-foreground">Adicione uma nova propriedade rural ao sistema</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card de Informações Básicas */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </div>
              <CardDescription>
                Dados principais da propriedade rural
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="nome" className={`flex items-center ${errosValidacao.nome ? 'text-destructive' : ''}`}>
                      <Home className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      Nome da Propriedade *
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="w-[200px]">Nome pelo qual a propriedade é conhecida</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome da propriedade"
                    required
                    className={errosValidacao.nome ? 'border-destructive' : ''}
                  />
                  {errosValidacao.nome && (
                    <p className="text-xs text-destructive mt-1">{errosValidacao.nome}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="clienteId" className={`flex items-center ${errosValidacao.clienteId ? 'text-destructive' : ''}`}>
                      <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      Proprietário *
                    </Label>
                  </div>
                  <Select
                    value={formData.clienteId}
                    onValueChange={(value) => handleSelectChange('clienteId', value)}
                  >
                    <SelectTrigger className={errosValidacao.clienteId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione o proprietário" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errosValidacao.clienteId && (
                    <p className="text-xs text-destructive mt-1">{errosValidacao.clienteId}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="endereco" className={`flex items-center ${errosValidacao.endereco ? 'text-destructive' : ''}`}>
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    Endereço *
                  </Label>
                </div>
                <Input
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Endereço completo"
                  required
                  className={errosValidacao.endereco ? 'border-destructive' : ''}
                />
                {errosValidacao.endereco && (
                  <p className="text-xs text-destructive mt-1">{errosValidacao.endereco}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="municipio" className={`flex items-center ${errosValidacao.municipio ? 'text-destructive' : ''}`}>
                    <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    Município *
                  </Label>
                  <Input
                    id="municipio"
                    name="municipio"
                    value={formData.municipio}
                    onChange={handleChange}
                    placeholder="Município"
                    required
                    className={errosValidacao.municipio ? 'border-destructive' : ''}
                  />
                  {errosValidacao.municipio && (
                    <p className="text-xs text-destructive mt-1">{errosValidacao.municipio}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado" className={errosValidacao.estado ? 'text-destructive' : ''}>
                    Estado *
                  </Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => handleSelectChange('estado', value)}
                  >
                    <SelectTrigger className={errosValidacao.estado ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasileiros.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errosValidacao.estado && (
                    <p className="text-xs text-destructive mt-1">{errosValidacao.estado}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="area" className={`flex items-center ${errosValidacao.area ? 'text-destructive' : ''}`}>
                      <Ruler className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      Área (hectares) *
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="w-[200px]">
                            Pequena: até 20 ha<br />
                            Média: 20 a 100 ha<br />
                            Grande: mais de 100 ha
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <Input
                      id="area"
                      name="area"
                      type="number"
                      value={formData.area === 0 ? '' : formData.area}
                      onChange={handleChange}
                      placeholder="Área em hectares"
                      className={`pr-8 ${errosValidacao.area ? 'border-destructive' : ''}`}
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">ha</span>
                  </div>
                  {errosValidacao.area && (
                    <p className="text-xs text-destructive mt-1">{errosValidacao.area}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Preview */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-primary" />
                <CardTitle className="text-lg">Visualização</CardTitle>
              </div>
              <CardDescription>
                Preview da propriedade
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-0">
              <div className="space-y-4">
                {formData.nome ? (
                  <div className="rounded-md border p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{formData.nome || 'Nome da Propriedade'}</h3>
                      {formData.area !== undefined && formData.area > 0 && (
                        <Badge className={tamanhoPropriedade.cor}>
                          {tamanhoPropriedade.texto}
                        </Badge>
                      )}
                    </div>
                    
                    {(formData.municipio || formData.estado) && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {[formData.municipio, formData.estado].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {formData.endereco && (
                      <div className="flex items-start">
                        <Building className="h-4 w-4 mr-1.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{formData.endereco}</span>
                      </div>
                    )}
                    
                    {formData.area !== undefined && formData.area > 0 && (
                      <div className="flex items-center">
                        <Ruler className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {formData.area !== undefined ? formData.area.toLocaleString('pt-BR') : '0'} hectares
                        </span>
                      </div>
                    )}

                    {(formData.coordenadas?.latitude !== 0 || formData.coordenadas?.longitude !== 0) && (
                      <div className="flex items-center">
                        <LocateFixed className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          Lat: {formData.coordenadas?.latitude.toFixed(6)}, Lon: {formData.coordenadas?.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-6">
                    <div className="text-center">
                      <Home className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Preencha os dados para visualizar a propriedade
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-auto flex flex-col gap-2 pb-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground w-full">
                Após preencher os dados básicos, você pode:
              </p>
              <Button 
                type="submit" 
                disabled={enviando}
                className="bg-primary hover:bg-primary/90 w-full shadow-sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Criar Propriedade
              </Button>
            </CardFooter>
          </Card>

          {/* Seção para o mapa integrado */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <MapIcon className="h-5 w-5 mr-2 text-primary" />
                <CardTitle className="text-lg">Localização no Mapa</CardTitle>
              </div>
              <CardDescription>
                Visualize e selecione a localização da propriedade no mapa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapSelector 
                initialPosition={formData.coordenadas} 
                onPositionChange={handleMapPositionChange} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação Fixos */}
        <div className="sticky bottom-0 bg-background border-t p-4 flex justify-between items-center mt-6 -mx-4 rounded-b-md">
          <Button variant="outline" asChild>
            <Link href="/propriedades">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>
          <Button 
            type="submit" 
            disabled={enviando}
            className="bg-primary hover:bg-primary/90"
          >
            {enviando ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Criar Propriedade
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}